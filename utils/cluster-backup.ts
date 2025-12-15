// Simple Delta E based palette generation
// Selects k most diverse colors using greedy max-min distance with saturation/lightness bonus
// Cluster similar colors together
const clusterColors = (
  colors: ColorData[],
  threshold: number = 20
): ColorData[][] => {
  if (colors.length === 0) return [];

  const clusters: ColorData[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < colors.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: ColorData[] = [colors[i]];
    assigned.add(i);

    // Find all similar colors
    for (let j = i + 1; j < colors.length; j++) {
      if (assigned.has(j)) continue;

      const distance = colorDistance(colors[i], colors[j]);
      if (distance < threshold) {
        cluster.push(colors[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
};

// Get representative color from a cluster (closest to cluster center)
const getClusterRepresentative = (cluster: ColorData[]): ColorData => {
  // Calculate the centroid (average color) of the cluster
  let sumR = 0,
    sumG = 0,
    sumB = 0;
  cluster.forEach((color) => {
    sumR += color.r;
    sumG += color.g;
    sumB += color.b;
  });
  const avgR = sumR / cluster.length;
  const avgG = sumG / cluster.length;
  const avgB = sumB / cluster.length;

  // Find the color closest to the centroid (most representative)
  let bestColor = cluster[0];
  let minDistance = Infinity;

  for (const color of cluster) {
    const dist = Math.sqrt(
      Math.pow(color.r - avgR, 2) +
        Math.pow(color.g - avgG, 2) +
        Math.pow(color.b - avgB, 2)
    );

    if (dist < minDistance) {
      minDistance = dist;
      bestColor = color;
    }
  }

  return bestColor;
};

// Generate palette by clustering colors and selecting representatives
export const generatePaletteFromColors = (
  colors: ColorData[],
  k: number = 5
): ColorData[] => {
  if (colors.length === 0) return [];
  if (colors.length <= k) return colors;

  // Cluster similar colors together
  const clusters = clusterColors(colors, 20);

  // Get representative from each cluster
  const representatives = clusters.map((cluster) => ({
    color: getClusterRepresentative(cluster),
    clusterSize: cluster.length,
  }));

  // Sort by cluster size (prefer color groups that appear more frequently)
  representatives.sort((a, b) => b.clusterSize - a.clusterSize);

  // Return top k representatives
  return representatives.slice(0, k).map((r) => r.color);
};
