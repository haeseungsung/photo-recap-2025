/**
 * Color Extraction 모듈 메인 export
 * 2025 Recap 프로젝트
 */

// 메인 처리 함수
export { processColorExtraction, analyzeImageColors } from './processColorExtraction.js'

// 개별 유틸리티
export { extractDominantColors } from './extractDominantColors.js'
export { selectTop2Colors, selectSingleDominantColor } from './selectTop2Colors.js'
export { generateColorName } from './generateColorName.js'
export { hexFromRgb, rgbFromHex } from './hexFromRgb.js'
export {
  rgbToLab,
  calculateDeltaE,
  calculateDeltaE2000,
  calculateRgbDistance
} from './calculateLabDeltaE.js'
