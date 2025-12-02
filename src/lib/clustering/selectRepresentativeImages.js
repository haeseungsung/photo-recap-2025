/**
 * 대표 이미지 선정 (4~6장)
 * 2025 Recap 프로젝트 - KeyColor 포함 비율이 높은 이미지 선정
 *
 * scoreA + scoreB 총합이 높은 순서대로 4~6장을 선택합니다.
 * 선택적으로 클러스터 A/B 균형을 고려할 수 있습니다.
 */

/**
 * KeyColor 포함 점수가 높은 대표 이미지 4~6장 선정
 * @param {Array<Object>} imageScores - calculateKeyColorScores의 결과
 * @param {Object} clusterAssignment - { clusterA: [...], clusterB: [...] }
 * @param {Object} options - { minCount: 4, maxCount: 6, balanced: false }
 * @returns {Array<RepresentativeImage>} 선정된 대표 이미지 배열
 */
export function selectRepresentativeImages(
  imageScores,
  clusterAssignment,
  options = {}
) {
  const { minCount = 4, maxCount = 6, balanced = false } = options

  // 1. totalScore 기준으로 내림차순 정렬
  const sortedScores = [...imageScores].sort((a, b) => b.totalScore - a.totalScore)

  if (!balanced) {
    // 2-A. 균형 없이 상위 4~6장 선택
    const count = Math.min(maxCount, sortedScores.length)
    const selected = sortedScores.slice(0, count)

    return selected.map(score => {
      const cluster = clusterAssignment.clusterA.includes(score.imageId) ? 'A' : 'B'
      return {
        ...score,
        cluster
      }
    })
  } else {
    // 2-B. 클러스터 A/B 균형을 고려하여 선택
    const selectedA = []
    const selectedB = []
    const result = []

    for (const score of sortedScores) {
      const isClusterA = clusterAssignment.clusterA.includes(score.imageId)

      if (isClusterA) {
        selectedA.push({ ...score, cluster: 'A' })
      } else {
        selectedB.push({ ...score, cluster: 'B' })
      }
    }

    // 각 클러스터에서 절반씩 선택 (예: 총 6장이면 A에서 3장, B에서 3장)
    const targetPerCluster = Math.ceil(maxCount / 2)
    const fromA = selectedA.slice(0, targetPerCluster)
    const fromB = selectedB.slice(0, targetPerCluster)

    result.push(...fromA, ...fromB)

    // 최소 개수 충족하지 못하면 나머지 추가
    if (result.length < minCount) {
      const remaining = sortedScores.filter(
        score => !result.some(r => r.imageId === score.imageId)
      )
      const needed = minCount - result.length
      const additional = remaining.slice(0, needed).map(score => {
        const cluster = clusterAssignment.clusterA.includes(score.imageId) ? 'A' : 'B'
        return { ...score, cluster }
      })
      result.push(...additional)
    }

    // totalScore 순으로 재정렬
    return result.sort((a, b) => b.totalScore - a.totalScore).slice(0, maxCount)
  }
}
