/**
 * Clustering Pipeline
 * 2025 Recap 프로젝트 - 클러스터링 전체 파이프라인
 *
 * 1. 이미지별 dominant colors 추출
 * 2. Top 2 KeyColors 선정
 * 3. 이미지를 클러스터 A/B로 배정
 * 4. KeyColor 포함 점수 계산
 * 5. 대표 이미지 4~6장 선정
 */

import { extractDominantColors } from '../color/extractDominantColors.js'
import { selectTop2Colors } from '../color/selectTop2Colors.js'
import { assignClusters } from './assignClusters.js'
import { calculateKeyColorScores } from './calculateKeyColorScore.js'
import { selectRepresentativeImages } from './selectRepresentativeImages.js'

/**
 * 클러스터링 전체 프로세스 실행
 * @param {Array<File>} imageFiles - 업로드된 이미지 파일 배열
 * @param {Function} onProgress - 진행률 콜백 (0-100)
 * @returns {Promise<ClusterResult>} 클러스터링 결과
 */
export async function processClustering(imageFiles, onProgress = () => {}) {
  const totalSteps = imageFiles.length + 4 // 이미지 개수 + 4개 주요 단계
  let currentStep = 0

  const updateProgress = () => {
    currentStep++
    onProgress(Math.round((currentStep / totalSteps) * 100))
  }

  try {
    // 1. 각 이미지에서 dominant colors 추출 (K-means 클러스터링)
    onProgress(0)
    const imagesWithColors = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const dominantColors = await extractDominantColors(file, 6)

      // dominant colors에 proportion 정보 추가 (임시로 균등 분배)
      // 추후 K-means 클러스터 크기 기반으로 개선 가능
      const colorsWithProportion = dominantColors.map(rgb => ({
        rgb,
        proportion: 1 / dominantColors.length
      }))

      imagesWithColors.push({
        imageId: file.name, // File name을 ID로 사용
        file: file, // 원본 파일 참조 유지
        dominantColors: colorsWithProportion
      })

      updateProgress()
    }

    // 2. 모든 이미지의 dominant colors에서 Top 2 KeyColors 선정
    const allDominantColors = imagesWithColors.map(img => img.dominantColors.map(c => c.rgb))
    const [keyColorA, keyColorB] = selectTop2Colors(allDominantColors)
    updateProgress()

    // 3. 이미지를 클러스터 A/B로 배정 (LAB 거리 기반)
    const clusterAssignment = assignClusters(imagesWithColors, keyColorA, keyColorB)
    updateProgress()

    // 4. 각 이미지의 KeyColor 포함 점수 계산
    const imageScores = calculateKeyColorScores(imagesWithColors, keyColorA, keyColorB)
    updateProgress()

    // 5. 대표 이미지 4~6장 선정 (totalScore 높은 순)
    const representatives = selectRepresentativeImages(imageScores, clusterAssignment, {
      minCount: 4,
      maxCount: 6,
      balanced: false // 균형 잡힌 선택 비활성화 (순수 점수 기반)
    })
    updateProgress()

    // 6. 대표 이미지에 File 객체 추가
    const representativesWithFiles = representatives.map(rep => {
      const imageData = imagesWithColors.find(img => img.imageId === rep.imageId)
      return {
        ...rep,
        file: imageData ? imageData.file : null
      }
    })

    // 7. 최종 결과 구조 생성
    return {
      clusterA: clusterAssignment.clusterA,
      clusterB: clusterAssignment.clusterB,
      representatives: representativesWithFiles,
      keyColors: {
        colorA: keyColorA,
        colorB: keyColorB
      }
    }
  } catch (error) {
    console.error('Clustering process failed:', error)
    throw error
  }
}
