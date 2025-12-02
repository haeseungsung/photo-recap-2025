/**
 * Color Extraction 모듈 메인 export
 * 2025 Recap 프로젝트
 */

// 메인 처리 함수
export { processColorExtraction, analyzeImageColors } from './processColorExtraction'

// 개별 유틸리티
export { extractDominantColors } from './extractDominantColors'
export { selectTop2Colors, selectSingleDominantColor } from './selectTop2Colors'
export { generateColorName } from './generateColorName'
export { hexFromRgb, rgbFromHex } from './hexFromRgb'
export {
  rgbToLab,
  calculateDeltaE,
  calculateDeltaE2000,
  calculateRgbDistance
} from './calculateLabDeltaE'

// 타입
export type {
  RGB,
  LAB,
  ColorInfo,
  ColorDistribution,
  ColorExtractionResult,
  ImageColorData
} from '../types/ColorExtractionResult'
