/**
 * selectRepresentativeImages 테스트
 */

import { describe, it, expect } from 'vitest'
import { selectRepresentativeImages } from './selectRepresentativeImages.js'

describe('selectRepresentativeImages', () => {
  it('totalScore가 높은 순서대로 4~6장 선택', () => {
    const imageScores = [
      { imageId: 'img1', scoreA: 0.8, scoreB: 0.6, totalScore: 1.4 },
      { imageId: 'img2', scoreA: 0.9, scoreB: 0.9, totalScore: 1.8 }, // 최고점
      { imageId: 'img3', scoreA: 0.3, scoreB: 0.2, totalScore: 0.5 },
      { imageId: 'img4', scoreA: 0.7, scoreB: 0.8, totalScore: 1.5 }, // 2위
      { imageId: 'img5', scoreA: 0.6, scoreB: 0.7, totalScore: 1.3 },
      { imageId: 'img6', scoreA: 0.5, scoreB: 0.4, totalScore: 0.9 }
    ]

    const clusterAssignment = {
      clusterA: ['img1', 'img2', 'img3'],
      clusterB: ['img4', 'img5', 'img6']
    }

    const result = selectRepresentativeImages(imageScores, clusterAssignment, {
      minCount: 4,
      maxCount: 6
    })

    // 상위 6개가 선택되어야 함
    expect(result.length).toBeLessThanOrEqual(6)
    expect(result.length).toBeGreaterThanOrEqual(4)

    // 첫 번째는 img2 (totalScore 1.8)
    expect(result[0].imageId).toBe('img2')

    // 두 번째는 img4 (totalScore 1.5)
    expect(result[1].imageId).toBe('img4')

    // 모든 대표 이미지는 cluster 정보 포함
    result.forEach(img => {
      expect(['A', 'B']).toContain(img.cluster)
    })
  })

  it('balanced 옵션 사용 시 클러스터 A/B 균형 유지', () => {
    const imageScores = [
      { imageId: 'img1', scoreA: 0.9, scoreB: 0.1, totalScore: 1.0 },
      { imageId: 'img2', scoreA: 0.8, scoreB: 0.1, totalScore: 0.9 },
      { imageId: 'img3', scoreA: 0.7, scoreB: 0.1, totalScore: 0.8 },
      { imageId: 'img4', scoreA: 0.1, scoreB: 0.9, totalScore: 1.0 },
      { imageId: 'img5', scoreA: 0.1, scoreB: 0.8, totalScore: 0.9 },
      { imageId: 'img6', scoreA: 0.1, scoreB: 0.7, totalScore: 0.8 }
    ]

    const clusterAssignment = {
      clusterA: ['img1', 'img2', 'img3'],
      clusterB: ['img4', 'img5', 'img6']
    }

    const result = selectRepresentativeImages(imageScores, clusterAssignment, {
      minCount: 6,
      maxCount: 6,
      balanced: true
    })

    const clusterACnt = result.filter(img => img.cluster === 'A').length
    const clusterBCnt = result.filter(img => img.cluster === 'B').length

    // A와 B가 거의 균등하게 선택되어야 함 (3:3 또는 4:2)
    expect(Math.abs(clusterACnt - clusterBCnt)).toBeLessThanOrEqual(1)
  })

  it('이미지 개수가 minCount보다 적으면 가능한 모든 이미지 반환', () => {
    const imageScores = [
      { imageId: 'img1', scoreA: 0.8, scoreB: 0.6, totalScore: 1.4 },
      { imageId: 'img2', scoreA: 0.7, scoreB: 0.5, totalScore: 1.2 }
    ]

    const clusterAssignment = {
      clusterA: ['img1'],
      clusterB: ['img2']
    }

    const result = selectRepresentativeImages(imageScores, clusterAssignment, {
      minCount: 4,
      maxCount: 6
    })

    // 2개밖에 없으므로 2개만 반환
    expect(result.length).toBe(2)
  })
})
