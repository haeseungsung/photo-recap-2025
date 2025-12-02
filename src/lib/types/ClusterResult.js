/**
 * Clustering Result Type Definition
 * 2025 Recap 프로젝트 - 클러스터링 결과 구조
 *
 * @typedef {Object} ClusterResult
 * @property {Array<string>} clusterA - Cluster A에 속한 이미지 ID 배열
 * @property {Array<string>} clusterB - Cluster B에 속한 이미지 ID 배열
 * @property {Array<RepresentativeImage>} representatives - 대표 이미지 4~6장
 */

/**
 * Representative Image
 * @typedef {Object} RepresentativeImage
 * @property {string} imageId - 이미지 ID
 * @property {number} scoreA - KeyColor A 포함 비율 (0-1)
 * @property {number} scoreB - KeyColor B 포함 비율 (0-1)
 * @property {number} totalScore - scoreA + scoreB 총합
 * @property {string} cluster - 'A' | 'B' 클러스터 소속
 */

/**
 * Image with Dominant Colors
 * @typedef {Object} ImageWithColors
 * @property {string} imageId - 이미지 ID (또는 File 객체)
 * @property {Array<DominantColor>} dominantColors - 추출된 dominant colors
 */

/**
 * Dominant Color with Proportion
 * @typedef {Object} DominantColor
 * @property {Object} rgb - { r, g, b }
 * @property {number} proportion - 이 색상이 이미지에서 차지하는 비율 (0-1)
 */

export {}
