import { ColorData } from "../types";

export const componentToHex = (c: number): string => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// Convert RGB to HSL to check saturation/lightness
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
};

// Convert RGB to LAB for Delta E calculation
const rgbToLab = (r: number, g: number, b: number) => {
  let R = r / 255,
    G = g / 255,
    B = b / 255;
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  X /= 0.95047;
  Y /= 1.0;
  Z /= 1.08883;

  X = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116;
  Y = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116;
  Z = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116;

  const L = 116 * Y - 16;
  const a = 500 * (X - Y);
  const bb = 200 * (Y - Z);

  return [L, a, bb];
};

// Calculates Perceptual Distance (Delta E CIE76)
export const colorDistance = (c1: ColorData, c2: ColorData): number => {
  const [L1, a1, b1] = rgbToLab(c1.r, c1.g, c1.b);
  const [L2, a2, b2] = rgbToLab(c2.r, c2.g, c2.b);
  return Math.sqrt(
    Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2)
  );
};

// Extract multiple dominant colors from a single image
export const getTopColors = (
  imageSrc: string,
  count: number = 5
): Promise<{
  colors: ColorData[];
  scoredColors: { color: ColorData; score: number }[];
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external URLs, not for blob/data URLs
    if (!imageSrc.startsWith("blob:") && !imageSrc.startsWith("data:")) {
      img.crossOrigin = "Anonymous";
    }
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      // Use smaller canvas for performance
      const MAX_SIZE = 300;
      let width = img.width;
      let height = img.height;

      // Scale down if too large, maintaining aspect ratio
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height).data;

      // Histogram approach: Quantize colors and count
      const colorCounts: {
        [key: string]: { count: number; r: number; g: number; b: number };
      } = {};
      const quantization = 16;

      for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i + 3] < 128) continue;

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

      // Score and sort all colors
      const scoredColors: Array<{ color: ColorData; score: number }> = [];

      Object.values(colorCounts).forEach((bucket) => {
        const avgR = Math.round(bucket.r / bucket.count);
        const avgG = Math.round(bucket.g / bucket.count);
        const avgB = Math.round(bucket.b / bucket.count);

        const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

        let score = bucket.count;
        score *= 1 + s * 15; // 원래 2  Boost saturation: up to 2x score for fully saturated colors

        if (l < 0.05 || l > 0.98) score *= 0.2; // 원래 0.6

        scoredColors.push({
          color: {
            r: avgR,
            g: avgG,
            b: avgB,
            hex: rgbToHex(avgR, avgG, avgB),
          },
          score: bucket.count, // 빈도만 저장
        });
      });

      // ---------- 1️⃣ score 기준 후보 축소 ----------
      scoredColors.sort((a, b) => b.score - a.score);

      const candidateColors = scoredColors
        .slice(0, 100) // 의미 있는 색만
        .map((sc) => sc.color);

      // ---------- 2️⃣ 거리 기반 클러스터링 ----------
      const clusters = clusterColors(candidateColors, 20);

      // ---------- 3️⃣ 클러스터별 총 빈도 계산 및 순위화 ----------
      const rankedClusters = clusters
        .map((cluster) => {
          const totalFrequency = cluster.reduce((sum, color) => {
            const sc = scoredColors.find((s) => s.color.hex === color.hex);
            return sum + (sc?.score ?? 0);
          }, 0);
          return { cluster, totalFrequency };
        })
        .sort((a, b) => b.totalFrequency - a.totalFrequency)
        .slice(0, count);

      // ---------- 4️⃣ 각 클러스터에서 대표색 선택 (saturation 고려) ----------
      const finalColors = rankedClusters.map(({ cluster }) => {
        // 클러스터 내에서 saturation이 높은 색 선택
        return cluster
          .map((color) => {
            const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
            const sc = scoredColors.find((s) => s.color.hex === color.hex);
            const frequency = sc?.score ?? 0;
            // saturation 가중치 적용
            const saturatedScore = frequency * (1 + s * 5);
            return { color, saturatedScore };
          })
          .sort((a, b) => b.saturatedScore - a.saturatedScore)[0].color;
      });

      const finalScoredColors = rankedClusters.map(
        ({ cluster, totalFrequency }) => {
          const color = cluster
            .map((color) => {
              const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
              const sc = scoredColors.find((s) => s.color.hex === color.hex);
              const frequency = sc?.score ?? 0;
              const saturatedScore = frequency * (1 + s * 15);
              return { color, saturatedScore };
            })
            .sort((a, b) => b.saturatedScore - a.saturatedScore)[0].color;
          return { color, score: totalFrequency };
        }
      );

      resolve({
        colors: finalColors,
        scoredColors: finalScoredColors as {
          color: ColorData;
          score: number;
        }[],
      });
    };

    img.onerror = reject;
  });
};

// Simple Delta E based palette generation
// Selects k most diverse colors using greedy max-min distance with saturation/lightness bonus
// Cluster similar colors together
const clusterColors = (
  colors: ColorData[],
  threshold: number = 20
): ColorData[][] => {
  const clusters: {
    colors: ColorData[];
    centroid: ColorData;
  }[] = [];

  for (const color of colors) {
    let matchedCluster = null;
    let minDistance = Infinity;

    for (const cluster of clusters) {
      const d = colorDistance(color, cluster.centroid);
      if (d < threshold && d < minDistance) {
        matchedCluster = cluster;
        minDistance = d;
      }
    }

    if (matchedCluster) {
      matchedCluster.colors.push(color);

      // centroid 업데이트
      const n = matchedCluster.colors.length;
      matchedCluster.centroid = {
        r: (matchedCluster.centroid.r * (n - 1) + color.r) / n,
        g: (matchedCluster.centroid.g * (n - 1) + color.g) / n,
        b: (matchedCluster.centroid.b * (n - 1) + color.b) / n,
      };
    } else {
      clusters.push({
        colors: [color],
        centroid: color,
      });
    }
  }

  return clusters.map((c) => c.colors);
};

// Get representative color from a cluster (closest to cluster center)
const getClusterRepresentative = (
  cluster: ColorData[],
  scoreMap: Map<string, number>
): ColorData => {
  return cluster
    .map((color) => ({
      color,
      score: scoreMap.get(color.hex) ?? 0,
    }))
    .sort((a, b) => b.score - a.score)[0].color;
};

// Generate palette by clustering colors and selecting representatives
export const generatePaletteFromColors = (
  colors: ColorData[],
  scoredColors: { color: ColorData; score: number }[],
  k: number = 5
): ColorData[] => {
  if (colors.length === 0) return [];

  const scoreMap = new Map(scoredColors.map((sc) => [sc.color.hex, sc.score]));

  const clusters = clusterColors(colors, 25);

  const ranked = clusters.map((cluster) => {
    const totalScore = cluster.reduce(
      (sum, c) => sum + (scoreMap.get(c.hex) ?? 0),
      0
    );

    const representativeColor = getClusterRepresentative(cluster, scoreMap);
    const [h, s, l] = rgbToHsl(
      representativeColor.r,
      representativeColor.g,
      representativeColor.b
    );

    // 2단계에서는 빈도만 사용 (1단계에서 이미 saturation 고려했음)
    var totalScoreModified = totalScore;

    // pleasing한 색상 범위만 선택 (너무 어둡거나 밝은 색 제외)
    if (l < 0.15 || l > 0.95) totalScoreModified *= 0.1;
    // 너무 채도가 낮은 회색조는 여전히 감점
    if (s < 0.1) totalScoreModified *= 0.3;

    return {
      color: representativeColor,
      totalScore: totalScoreModified,
    };
  });

  ranked.sort((a, b) => b.totalScore - a.totalScore);

  let result = ranked.slice(0, k).map((r) => r.color);

  // If we don't have enough colors, add more from the original scored colors
  if (result.length < k) {
    const usedHexes = new Set(result.map((c) => c.hex));
    const remaining = scoredColors
      .filter((sc) => !usedHexes.has(sc.color.hex))
      .sort((a, b) => b.score - a.score)
      .map((sc) => sc.color);

    result = [...result, ...remaining.slice(0, k - result.length)];
  }

  return result;
};

/* Palette Filter */
// Apply selective color filter: keep pixels similar to palette hues, grayscale the rest
export const applyPaletteFilter = (
  imageSrc: string,
  paletteColors: ColorData[],
  hueThreshold: number = 15, // Lower = stricter matching
  minSaturation: number = 0.18, // Exclude too gray colors
  halftoneSize: number = 15 // Halftone dot size (15x15 blocks)
): Promise<{ url: string; colorCounts: number[] }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for external URLs, not for blob/data URLs
    if (!imageSrc.startsWith("blob:") && !imageSrc.startsWith("data:")) {
      img.crossOrigin = "Anonymous";
    }
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      // Resize image to fixed size for consistent dot count
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      // Scale down if too large, maintaining aspect ratio
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert palette to HSL
      const paletteHSL = paletteColors.map((color) => {
        const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
        return { h: h * 360, s, l }; // Convert h to degrees
      });

      // Track which pixels are grayscale for halftone effect
      const isGrayscale: boolean[] = new Array(canvas.width * canvas.height);

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const [h, s, l] = rgbToHsl(r, g, b);
        const hDeg = h * 360;

        let keepColor = false;

        // Check if pixel matches any palette color
        for (const p of paletteHSL) {
          if (hueDistance(hDeg, p.h) < hueThreshold && s > minSaturation) {
            keepColor = true;
            break;
          }
        }

        const pixelIndex = i / 4;
        isGrayscale[pixelIndex] = !keepColor;

        // If not matching, convert to grayscale
        if (!keepColor) {
          const gray = Math.round(toGray(r, g, b));
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Apply halftone effect to entire image and get color counts
      const colorCounts = applyHalftone(
        canvas,
        isGrayscale,
        paletteColors,
        halftoneSize
      );

      resolve({
        url: canvas.toDataURL("image/jpeg", 0.9),
        colorCounts,
      });
    };
    img.onerror = reject;
  });
};

// Apply halftone dot pattern to entire image
const applyHalftone = (
  canvas: HTMLCanvasElement,
  isGrayscale: boolean[],
  paletteColors: ColorData[],
  dotSize: number = 15
): number[] => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width, height } = canvas;

  // Get original image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Create a new canvas for the halftone effect
  const halftoneCanvas = document.createElement("canvas");
  halftoneCanvas.width = width;
  halftoneCanvas.height = height;
  const halftoneCtx = halftoneCanvas.getContext("2d")!;

  // White background
  halftoneCtx.fillStyle = "#ffffff";
  halftoneCtx.fillRect(0, 0, width, height);

  // Track how many blocks each palette color is applied to
  const colorCounts = new Array(paletteColors.length).fill(0);

  // Process each block
  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      // Calculate average color and brightness in this block
      let avgR = 0,
        avgG = 0,
        avgB = 0;
      let avgBrightness = 0;
      let count = 0;
      let blockIsGrayscale = true;

      for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
        for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          const pixelIndex = (y + dy) * width + (x + dx);

          avgR += data[idx];
          avgG += data[idx + 1];
          avgB += data[idx + 2];
          avgBrightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          count++;

          if (!isGrayscale[pixelIndex]) {
            blockIsGrayscale = false;
          }
        }
      }

      if (count === 0) continue;

      avgR = Math.round(avgR / count);
      avgG = Math.round(avgG / count);
      avgB = Math.round(avgB / count);
      avgBrightness = avgBrightness / count;

      // Calculate dot radius based on brightness
      // Map brightness to 30%-100% of max radius
      const brightnessRatio = (255 - avgBrightness) / 255;
      const radius = (0.3 + brightnessRatio * 0.7) * (dotSize / 2);

      if (radius > 0.5) {
        halftoneCtx.beginPath();
        halftoneCtx.arc(
          x + dotSize / 2,
          y + dotSize / 2,
          radius,
          0,
          Math.PI * 2
        );

        // Color dot for color areas, black dot for grayscale areas
        if (blockIsGrayscale) {
          halftoneCtx.fillStyle = "#000000";
        } else {
          // Use closest palette color instead of original color
          const closestColorIndex = findClosestPaletteColorIndex(
            avgR,
            avgG,
            avgB,
            paletteColors
          );
          const paletteColor = paletteColors[closestColorIndex];
          halftoneCtx.fillStyle = `rgb(${paletteColor.r}, ${paletteColor.g}, ${paletteColor.b})`;

          // Increment count for this palette color
          colorCounts[closestColorIndex]++;
        }
        halftoneCtx.fill();
      }
    }
  }

  // Copy halftone result back to original canvas
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(halftoneCanvas, 0, 0);

  return colorCounts;
};

// RGB → Grayscale
const toGray = (r: number, g: number, b: number): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

// Find closest palette color
const findClosestPaletteColor = (
  r: number,
  g: number,
  b: number,
  palette: ColorData[]
): ColorData => {
  let minDist = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const dist = Math.sqrt(
      Math.pow(r - color.r, 2) +
        Math.pow(g - color.g, 2) +
        Math.pow(b - color.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }

  return closest;
};

// Find closest palette color index
const findClosestPaletteColorIndex = (
  r: number,
  g: number,
  b: number,
  palette: ColorData[]
): number => {
  let minDist = Infinity;
  let closestIndex = 0;

  palette.forEach((color, index) => {
    const dist = Math.sqrt(
      Math.pow(r - color.r, 2) +
        Math.pow(g - color.g, 2) +
        Math.pow(b - color.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closestIndex = index;
    }
  });

  return closestIndex;
};

// Hue distance (circular)
const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
};
