/**
 * assignClusters 테스트
 */

import { describe, it, expect } from 'vitest'
import { assignClusters } from './assignClusters.js'

describe('assignClusters', () => {
  it('이미지를 더 가까운 KeyColor로 배정해야 함', () => {
    const images = [
      {
        imageId: 'img1',
        dominantColors: [
          { rgb: { r: 255, g: 100, b: 100 }, proportion: 0.6 }, // 빨강 계열
          { rgb: { r: 200, g: 80, b: 80 }, proportion: 0.4 }
        ]
      },
      {
        imageId: 'img2',
        dominantColors: [
          { rgb: { r: 100, g: 100, b: 255 }, proportion: 0.7 }, // 파랑 계열
          { rgb: { r: 80, g: 80, b: 200 }, proportion: 0.3 }
        ]
      },
      {
        imageId: 'img3',
        dominantColors: [
          { rgb: { r: 250, g: 90, b: 90 }, proportion: 0.8 }, // 빨강 계열
          { rgb: { r: 150, g: 150, b: 150 }, proportion: 0.2 }
        ]
      }
    ]

    const keyColorA = { r: 255, g: 0, b: 0 } // 빨강
    const keyColorB = { r: 0, g: 0, b: 255 } // 파랑

    const result = assignClusters(images, keyColorA, keyColorB)

    // img1과 img3는 빨강에 가까우므로 clusterA
    expect(result.clusterA).toContain('img1')
    expect(result.clusterA).toContain('img3')

    // img2는 파랑에 가까우므로 clusterB
    expect(result.clusterB).toContain('img2')
  })

  it('빈 배열에 대해 빈 클러스터를 반환해야 함', () => {
    const result = assignClusters([], { r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 })

    expect(result.clusterA).toEqual([])
    expect(result.clusterB).toEqual([])
  })

  it('거리가 매우 비슷한 경우 tie-breaker 적용', () => {
    const images = [
      {
        imageId: 'img1',
        dominantColors: [
          { rgb: { r: 128, g: 128, b: 128 }, proportion: 0.5 }, // 회색 (중립)
          { rgb: { r: 130, g: 130, b: 130 }, proportion: 0.5 }
        ]
      }
    ]

    const keyColorA = { r: 100, g: 100, b: 100 }
    const keyColorB = { r: 150, g: 150, b: 150 }

    const result = assignClusters(images, keyColorA, keyColorB)

    // 어느 클러스터든 하나에 배정되어야 함
    const totalAssigned = result.clusterA.length + result.clusterB.length
    expect(totalAssigned).toBe(1)
  })
})
