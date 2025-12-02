/**
 * 자동 컬러 네이밍 생성
 * 2025 Recap 프로젝트 - Pantone 스타일 컬러 네이밍
 *
 * RGB 값을 기반으로 "Adjective + Color" 형식의 감성적인 이름을 자동 생성합니다.
 * 예: "Soft Coral", "Deep Walnut", "Morning Fog"
 */

import { rgbToLab } from './calculateLabDeltaE.js'

// 색상 형용사 (밝기/채도 기반)
const ADJECTIVES = {
  veryLight: ['Pale', 'Soft', 'Light', 'Gentle', 'Delicate'],
  light: ['Pastel', 'Muted', 'Dusty', 'Tender', 'Subtle'],
  medium: ['Pure', 'True', 'Classic', 'Rich', 'Warm'],
  dark: ['Deep', 'Dark', 'Bold', 'Strong', 'Vivid'],
  veryDark: ['Midnight', 'Shadow', 'Charcoal', 'Ink', 'Ebony']
}

// 기본 색상 이름 (색조 기반)
const COLOR_NAMES = {
  red: ['Red', 'Coral', 'Rose', 'Crimson', 'Ruby', 'Cherry'],
  orange: ['Orange', 'Peach', 'Apricot', 'Amber', 'Tangerine'],
  yellow: ['Yellow', 'Gold', 'Honey', 'Lemon', 'Butter', 'Cream'],
  green: ['Green', 'Sage', 'Moss', 'Olive', 'Mint', 'Jade'],
  cyan: ['Cyan', 'Teal', 'Aqua', 'Turquoise', 'Ocean'],
  blue: ['Blue', 'Sky', 'Azure', 'Cerulean', 'Indigo', 'Sapphire'],
  purple: ['Purple', 'Lavender', 'Violet', 'Plum', 'Mauve', 'Lilac'],
  pink: ['Pink', 'Blush', 'Rose', 'Fuchsia', 'Magenta'],
  brown: ['Brown', 'Taupe', 'Mocha', 'Walnut', 'Chocolate', 'Espresso'],
  gray: ['Gray', 'Silver', 'Fog', 'Stone', 'Ash', 'Slate'],
  white: ['White', 'Ivory', 'Pearl', 'Cream', 'Snow'],
  black: ['Black', 'Onyx', 'Noir', 'Carbon', 'Shadow']
}

/**
 * RGB 값으로부터 자동 컬러 이름 생성
 * @param {Object} rgb - RGB 색상 { r, g, b }
 * @returns {string} Pantone 스타일 컬러 이름
 */
export function generateColorName(rgb) {
  const lab = rgbToLab(rgb)

  // 1. 밝기 기반 형용사 선택
  const adjective = selectAdjective(lab)

  // 2. 색조 기반 색상 이름 선택
  const colorName = selectColorName(rgb, lab)

  // 3. 조합
  return `${adjective} ${colorName}`
}

/**
 * LAB 밝기(L) 값에 따른 형용사 선택
 */
function selectAdjective(lab) {
  const { l } = lab
  let adjectiveGroup

  if (l >= 85) {
    adjectiveGroup = ADJECTIVES.veryLight
  } else if (l >= 70) {
    adjectiveGroup = ADJECTIVES.light
  } else if (l >= 40) {
    adjectiveGroup = ADJECTIVES.medium
  } else if (l >= 20) {
    adjectiveGroup = ADJECTIVES.dark
  } else {
    adjectiveGroup = ADJECTIVES.veryDark
  }

  // 랜덤 선택 (다양성 확보)
  return adjectiveGroup[Math.floor(Math.random() * adjectiveGroup.length)]
}

/**
 * RGB 값에 따른 색상 이름 선택
 */
function selectColorName(rgb, lab) {
  const { r, g, b } = rgb
  const { l, a, b: bLab } = lab

  // 무채색 판별 (채도가 매우 낮음)
  const chroma = Math.sqrt(a * a + bLab * bLab)

  if (chroma < 10) {
    // 무채색
    if (l >= 85) return randomFrom(COLOR_NAMES.white)
    if (l <= 15) return randomFrom(COLOR_NAMES.black)
    return randomFrom(COLOR_NAMES.gray)
  }

  // 색조(Hue) 계산 (RGB 기반)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return randomFrom(COLOR_NAMES.gray)

  let hue = 0

  if (max === r) {
    hue = ((g - b) / delta) % 6
  } else if (max === g) {
    hue = (b - r) / delta + 2
  } else {
    hue = (r - g) / delta + 4
  }

  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360

  // 채도 고려
  const saturation = delta / max

  // 색조 범위에 따른 색상 이름 선택
  if (hue >= 345 || hue < 15) {
    return randomFrom(COLOR_NAMES.red)
  } else if (hue >= 15 && hue < 45) {
    return randomFrom(COLOR_NAMES.orange)
  } else if (hue >= 45 && hue < 70) {
    return randomFrom(COLOR_NAMES.yellow)
  } else if (hue >= 70 && hue < 150) {
    return randomFrom(COLOR_NAMES.green)
  } else if (hue >= 150 && hue < 190) {
    return randomFrom(COLOR_NAMES.cyan)
  } else if (hue >= 190 && hue < 260) {
    return randomFrom(COLOR_NAMES.blue)
  } else if (hue >= 260 && hue < 290) {
    return randomFrom(COLOR_NAMES.purple)
  } else if (hue >= 290 && hue < 330) {
    // 채도가 높으면 Pink, 낮으면 Purple
    return saturation > 0.5 ? randomFrom(COLOR_NAMES.pink) : randomFrom(COLOR_NAMES.purple)
  } else {
    // 330-345: Pink to Red
    return randomFrom(COLOR_NAMES.pink)
  }
}

/**
 * 배열에서 랜덤 요소 선택
 */
function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)]
}
