import { ColorData } from '../types';

export const componentToHex = (c: number): string => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// Convert RGB to HSL to check saturation/lightness
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
};

// Convert RGB to LAB for Delta E calculation
const rgbToLab = (r: number, g: number, b: number) => {
  let R = r / 255, G = g / 255, B = b / 255;
  R = (R > 0.04045) ? Math.pow((R + 0.055) / 1.055, 2.4) : (R / 12.92);
  G = (G > 0.04045) ? Math.pow((G + 0.055) / 1.055, 2.4) : (G / 12.92);
  B = (B > 0.04045) ? Math.pow((B + 0.055) / 1.055, 2.4) : (B / 12.92);

  let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  X /= 0.95047; Y /= 1.00000; Z /= 1.08883;

  X = (X > 0.008856) ? Math.pow(X, 1/3) : (7.787 * X) + (16/116);
  Y = (Y > 0.008856) ? Math.pow(Y, 1/3) : (7.787 * Y) + (16/116);
  Z = (Z > 0.008856) ? Math.pow(Z, 1/3) : (7.787 * Z) + (16/116);

  const L = (116 * Y) - 16;
  const a = 500 * (X - Y);
  const bb = 200 * (Y - Z);

  return [L, a, bb];
};

// Calculates Perceptual Distance (Delta E CIE76)
export const colorDistance = (c1: ColorData, c2: ColorData): number => {
  const [L1, a1, b1] = rgbToLab(c1.r, c1.g, c1.b);
  const [L2, a2, b2] = rgbToLab(c2.r, c2.g, c2.b);
  return Math.sqrt(Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2));
};

export const getDominantColor = (imageSrc: string): Promise<ColorData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      // OPTIMIZATION: Smaller canvas for faster processing
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;

      // Histogram approach: Quantize colors and count
      const colorCounts: {[key: string]: {count: number, r: number, g: number, b: number}} = {};
      const quantization = 16; // Group similar colors

      // OPTIMIZATION: Sample every other pixel (50% faster)
      for (let i = 0; i < imageData.length; i += 8) {
        if (imageData[i + 3] < 128) continue; // Skip transparent

        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        const rQ = Math.round(r / quantization) * quantization;
        const gQ = Math.round(g / quantization) * quantization;
        const bQ = Math.round(b / quantization) * quantization;

        const key = `${rQ},${gQ},${bQ}`;

        if (!colorCounts[key]) {
            colorCounts[key] = { count: 0, r: 0, g: 0, b: 0 };
        }
        colorCounts[key].count++;
        colorCounts[key].r += r;
        colorCounts[key].g += g;
        colorCounts[key].b += b;
      }

      let bestColor = { r: 0, g: 0, b: 0 };
      let maxScore = -1;

      Object.values(colorCounts).forEach(bucket => {
        const avgR = Math.round(bucket.r / bucket.count);
        const avgG = Math.round(bucket.g / bucket.count);
        const avgB = Math.round(bucket.b / bucket.count);
        
        const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

        // Scoring Algorithm to favor Vibrant Colors:
        // 1. Base score is frequency (count)
        // 2. Bonus for higher saturation (prevents gray/muddy colors from winning just because they are common background)
        // 3. Bonus for green hues (nature colors: trees, grass, landscapes)
        // 4. Penalty for extreme lightness/darkness (unless very frequent)

        let score = bucket.count;

        // Boost saturation: up to 2x score for fully saturated colors
        score *= (1 + s);

        // Bonus for green/nature colors (Hue 80-160 degrees = yellowy-green to cyan-green)
        // This helps capture natural greens from trees, grass, and landscapes
        if (h >= 80/360 && h <= 160/360) {
          score *= 1.3; // 30% bonus for green hues
        }

        // Slight penalty for very dark (< 5%) or very bright (> 98%) pixels
        // as they are often shadows or highlights, not the "color"
        if (l < 0.05 || l > 0.98) score *= 0.6;

        if (score > maxScore) {
          maxScore = score;
          bestColor = { r: avgR, g: avgG, b: avgB };
        }
      });
      
      resolve({
        r: bestColor.r, 
        g: bestColor.g, 
        b: bestColor.b,
        hex: rgbToHex(bestColor.r, bestColor.g, bestColor.b)
      });
    };
    img.onerror = reject;
  });
};

// Improved Clustering with Hue Diversity
export const generatePaletteFromColors = (colors: ColorData[], k: number = 5): ColorData[] => {
  if (colors.length === 0) return [];

  // 1. Filter out duplicates or extremely similar colors using Delta E
  const distinctColors: ColorData[] = [];
  colors.forEach(c => {
    const isSimilar = distinctColors.some(existing => colorDistance(c, existing) < 10);
    if (!isSimilar) {
        distinctColors.push(c);
    }
  });

  if (distinctColors.length <= k) return distinctColors;

  // 2. Hue-based diverse initialization
  // Convert colors to HSL and group by hue regions
  const colorsWithHsl = distinctColors.map(c => {
    const [h, s, l] = rgbToHsl(c.r, c.g, c.b);
    return { color: c, h, s, l };
  });

  // Sort by hue to spread across color wheel
  colorsWithHsl.sort((a, b) => a.h - b.h);

  // Pick centroids spread across hue spectrum
  let centroids: ColorData[] = [];
  const hueStep = 1.0 / k; // Divide hue wheel into k segments

  for (let i = 0; i < k; i++) {
    const targetHue = i * hueStep;

    // Find color closest to target hue with decent saturation
    let bestColor = colorsWithHsl[0].color;
    let bestScore = -1;

    colorsWithHsl.forEach(({ color, h, s, l }) => {
      // Hue distance (circular)
      let hueDist = Math.abs(h - targetHue);
      if (hueDist > 0.5) hueDist = 1.0 - hueDist;

      // Prefer colors with good saturation and not too dark/bright
      const saturationBonus = s;
      const lightnessBonus = (l > 0.2 && l < 0.8) ? 1.0 : 0.5;

      const score = (1.0 - hueDist) * saturationBonus * lightnessBonus;

      if (score > bestScore) {
        bestScore = score;
        bestColor = color;
      }
    });

    centroids.push(bestColor);
  }

  // 3. K-means Iteration (Standard)
  let assignments = new Array(distinctColors.length).fill(-1);
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 10) {
    changed = false;
    const clusters: ColorData[][] = Array.from({ length: k }, () => []);

    // Assign points to closest centroid
    distinctColors.forEach((c, idx) => {
        let minDist = Infinity;
        let clusterIdx = 0;
        centroids.forEach((cent, ci) => {
            const dist = colorDistance(c, cent);
            if (dist < minDist) {
                minDist = dist;
                clusterIdx = ci;
            }
        });

        if (assignments[idx] !== clusterIdx) {
            assignments[idx] = clusterIdx;
            changed = true;
        }
        clusters[clusterIdx].push(c);
    });

    // Recompute centroids
    clusters.forEach((cluster, i) => {
        if (cluster.length > 0) {
            const r = Math.round(cluster.reduce((sum, c) => sum + c.r, 0) / cluster.length);
            const g = Math.round(cluster.reduce((sum, c) => sum + c.g, 0) / cluster.length);
            const b = Math.round(cluster.reduce((sum, c) => sum + c.b, 0) / cluster.length);
            centroids[i] = { r, g, b, hex: rgbToHex(r, g, b) };
        }
    });

    iterations++;
  }
  
  return centroids;
};
