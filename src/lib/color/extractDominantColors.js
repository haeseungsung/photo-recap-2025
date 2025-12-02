/**
 * 이미지에서 dominant colors 추출
 * 2025 Recap 프로젝트 - 색상 추출 핵심 알고리즘
 *
 * 이미지를 캔버스에 로드하고 픽셀을 샘플링하여 대표 색상 6-8개를 추출합니다.
 */

import { calculateRgbDistance } from './calculateLabDeltaE.js'

/**
 * 이미지 파일에서 dominant colors 추출
 * @param {File} imageFile - 업로드된 이미지 파일
 * @param {number} numColors - 추출할 색상 개수 (기본 6개)
 * @returns {Promise<Array>} RGB 배열 (dominant colors)
 */
export async function extractDominantColors(imageFile, numColors = 6) {
  // 1. 이미지를 캔버스에 로드
  const imageData = await loadImageToCanvas(imageFile)

  // 2. 픽셀 샘플링 (모든 픽셀을 사용하면 느리므로 일부만 샘플링)
  const sampledPixels = samplePixels(imageData, 10000) // 최대 10000개 픽셀 샘플링

  // 3. K-means 클러스터링으로 대표 색상 추출
  const dominantColors = kMeansClustering(sampledPixels, numColors)

  return dominantColors
}

/**
 * 이미지 파일을 캔버스에 로드하고 ImageData 반환
 */
async function loadImageToCanvas(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      // 캔버스 생성
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 이미지 리사이즈 (512px로 다운샘플링하여 성능 향상)
      const maxSize = 512
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // ImageData 추출
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // URL 해제
      URL.revokeObjectURL(url)

      resolve(imageData)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * ImageData에서 픽셀 샘플링 (개선된 버전 - 채도 기반 필터링)
 * @param {ImageData} imageData - 이미지 데이터
 * @param {number} maxSamples - 최대 샘플 개수
 * @returns {Array} RGB 배열
 */
function samplePixels(imageData, maxSamples) {
  const pixels = []
  const { data, width, height } = imageData
  const totalPixels = width * height

  // 샘플링 간격 계산
  const step = Math.max(1, Math.floor(totalPixels / maxSamples))

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // 투명도가 너무 낮은 픽셀은 제외
    if (a < 128) continue

    // 밝기 계산
    const brightness = (r + g + b) / 3

    // 너무 어두운 픽셀 제외 (검정 머리, 눈동자, 옷 등)
    if (brightness < 40) continue

    // 너무 밝은 픽셀 제외 (흰 배경 등)
    if (brightness > 240) continue

    // 채도(Saturation) 계산 - HSV 방식
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const saturation = max === 0 ? 0 : delta / max

    // 무채색(회색, 검정, 흰색) 필터링
    // 채도가 너무 낮으면 제외 (회색 계열)
    if (saturation < 0.15) continue

    // 비비드한 색상 우선: 채도가 높은 픽셀 우대
    // 채도가 높은 픽셀은 여러 번 추가하여 가중치 부여
    const weight = saturation > 0.4 ? 2 : 1
    for (let w = 0; w < weight; w++) {
      pixels.push({ r, g, b })
    }
  }

  return pixels
}

/**
 * K-means 클러스터링으로 대표 색상 추출
 * @param {Array} pixels - RGB 픽셀 배열
 * @param {number} k - 클러스터 개수
 * @param {number} maxIterations - 최대 반복 횟수
 * @returns {Array} RGB 배열 (centroid colors)
 */
function kMeansClustering(pixels, k, maxIterations = 20) {
  if (pixels.length === 0) return []
  if (pixels.length <= k) return pixels

  // 1. 초기 중심점 설정 (개선: 채도가 높은 픽셀 우선)
  let centroids = []
  const usedIndices = new Set()

  // 픽셀을 채도 순으로 정렬
  const pixelsWithSaturation = pixels.map((pixel, index) => {
    const max = Math.max(pixel.r, pixel.g, pixel.b)
    const min = Math.min(pixel.r, pixel.g, pixel.b)
    const delta = max - min
    const saturation = max === 0 ? 0 : delta / max
    return { pixel, saturation, index }
  })

  // 채도 높은 순으로 정렬
  pixelsWithSaturation.sort((a, b) => b.saturation - a.saturation)

  // 상위 20%에서 초기 중심점 선택
  const topPercentile = Math.max(k * 10, Math.floor(pixels.length * 0.2))

  while (centroids.length < k && centroids.length < pixelsWithSaturation.length) {
    const randomIndex = Math.floor(Math.random() * topPercentile)
    if (!usedIndices.has(randomIndex)) {
      centroids.push({ ...pixelsWithSaturation[randomIndex].pixel })
      usedIndices.add(randomIndex)
    }
  }

  // 2. K-means 반복
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // 각 픽셀을 가장 가까운 centroid에 할당
    const clusters = Array.from({ length: k }, () => [])

    for (const pixel of pixels) {
      let minDistance = Infinity
      let closestCluster = 0

      for (let i = 0; i < centroids.length; i++) {
        const distance = calculateRgbDistance(pixel, centroids[i])
        if (distance < minDistance) {
          minDistance = distance
          closestCluster = i
        }
      }

      clusters[closestCluster].push(pixel)
    }

    // 새로운 centroid 계산
    const newCentroids = []
    let hasChanged = false

    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) {
        // 빈 클러스터는 기존 centroid 유지
        newCentroids.push(centroids[i])
        continue
      }

      const newCentroid = {
        r: Math.round(clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length),
        g: Math.round(clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length),
        b: Math.round(clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length),
      }

      if (
        newCentroid.r !== centroids[i].r ||
        newCentroid.g !== centroids[i].g ||
        newCentroid.b !== centroids[i].b
      ) {
        hasChanged = true
      }

      newCentroids.push(newCentroid)
    }

    centroids = newCentroids

    // 수렴하면 조기 종료
    if (!hasChanged) break
  }

  return centroids
}
