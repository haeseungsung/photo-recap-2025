/**
 * Color Extraction 결과 타입 정의
 * 2025 Recap 프로젝트 - 색상 분석 데이터 구조
 */

export type RGB = {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export type LAB = {
  l: number // 0-100 (Lightness)
  a: number // -128 to 127 (green to red)
  b: number // -128 to 127 (blue to yellow)
}

export type ColorInfo = {
  name: string // 자동 생성된 컬러 이름 (예: "Soft Coral")
  hex: string // HEX 코드 (예: "#FF6B6B")
  rgb: RGB // RGB 값
  lab: LAB // LAB 색 공간 값
  weight?: number // 색상의 비중 (0-1)
}

export type ColorDistribution = {
  colors: ColorInfo[] // dominant colors 6-8개
  totalPixels: number // 전체 샘플링된 픽셀 수
}

export type ColorExtractionResult = {
  top2: [ColorInfo, ColorInfo] // 상위 2개 대표 색상
  distribution: ColorDistribution // 전체 색상 분포
}

export type ImageColorData = {
  imageId: string
  dominantColor: ColorInfo // 이미지별 대표 색상 1개
  clusterId: 'A' | 'B' // Top2 중 어디에 속하는지
}
