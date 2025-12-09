/**
 * Color Palette Sorting
 * 2025 Recap 프로젝트 - 컬러 팔레트 정렬 및 이름 생성
 */

/**
 * RGB를 HSL로 변환
 * @param {Object} rgb - {r, g, b} (0-255)
 * @returns {Object} {h, s, l} (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(rgb) {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      case b:
        h = ((r - g) / delta + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * 색상 팔레트 정렬 (저채도→고채도, 고명도→저명도 등)
 * @param {Array} palette - RGB 배열
 * @param {string} sortType - 'saturation-asc', 'saturation-desc', 'lightness-asc', 'lightness-desc', 'hue'
 * @returns {Array} 정렬된 RGB 배열
 */
export function sortPalette(palette, sortType = 'auto') {
  const paletteWithHsl = palette.map(rgb => ({
    rgb,
    hsl: rgbToHsl(rgb)
  }))

  // auto: 팔레트 특성에 따라 자동 선택
  if (sortType === 'auto') {
    // 채도 범위 계산
    const saturations = paletteWithHsl.map(c => c.hsl.s)
    const satRange = Math.max(...saturations) - Math.min(...saturations)

    // 명도 범위 계산
    const lightnesses = paletteWithHsl.map(c => c.hsl.l)
    const lightRange = Math.max(...lightnesses) - Math.min(...lightnesses)

    // 채도 범위가 더 크면 채도 순, 아니면 명도 순
    if (satRange > lightRange) {
      sortType = 'saturation-asc'
    } else {
      sortType = 'lightness-desc'
    }
  }

  // 정렬 로직
  switch (sortType) {
    case 'saturation-asc':
      // 저채도 → 고채도
      paletteWithHsl.sort((a, b) => a.hsl.s - b.hsl.s)
      break
    case 'saturation-desc':
      // 고채도 → 저채도
      paletteWithHsl.sort((a, b) => b.hsl.s - a.hsl.s)
      break
    case 'lightness-asc':
      // 저명도(어두움) → 고명도(밝음)
      paletteWithHsl.sort((a, b) => a.hsl.l - b.hsl.l)
      break
    case 'lightness-desc':
      // 고명도(밝음) → 저명도(어두움)
      paletteWithHsl.sort((a, b) => b.hsl.l - a.hsl.l)
      break
    case 'hue':
      // 색상환 순서 (빨강→주황→노랑→초록→파랑→보라)
      paletteWithHsl.sort((a, b) => a.hsl.h - b.hsl.h)
      break
    default:
      // 기본: 채도 오름차순
      paletteWithHsl.sort((a, b) => a.hsl.s - b.hsl.s)
  }

  return paletteWithHsl.map(c => c.rgb)
}

/**
 * 팔레트 전체에 이름 붙이기
 * @param {Array} palette - RGB 배열
 * @returns {string} 팔레트 이름
 */
export function generatePaletteName(palette) {
  if (!palette || palette.length === 0) {
    return 'Empty Palette'
  }

  const paletteWithHsl = palette.map(rgb => ({
    rgb,
    hsl: rgbToHsl(rgb)
  }))

  // 1. 평균 채도 계산
  const avgSaturation = paletteWithHsl.reduce((sum, c) => sum + c.hsl.s, 0) / palette.length

  // 2. 평균 명도 계산
  const avgLightness = paletteWithHsl.reduce((sum, c) => sum + c.hsl.l, 0) / palette.length

  // 3. 주요 색상(Hue) 분포 분석
  const hues = paletteWithHsl.map(c => c.hsl.h)
  const dominantHueRange = getDominantHueRange(hues)

  // 4. 이름 생성 로직 - 위트있는 조합
  const lightnessNames = {
    veryBright: ['Dreamy', 'Heavenly', 'Angelic', 'Cotton Candy', 'Cloud Nine'],
    bright: ['Sunny', 'Cheerful', 'Breezy', 'Morning Glow', 'Daylight'],
    medium: ['Cozy', 'Mellow', 'Warm Hug', 'Golden Hour', 'Afternoon'],
    deep: ['Moody', 'Twilight', 'Vintage', 'Dusk', 'Candlelit'],
    dark: ['Midnight', 'Mysterious', 'Noir', 'Starry Night', 'Moonlit']
  }

  const saturationNames = {
    vivid: ['Electric', 'Poppy', 'Neon', 'Vibrant', 'Bold'],
    rich: ['Lush', 'Velvet', 'Royal', 'Jewel-toned', 'Opulent'],
    muted: ['Dusty', 'Vintage', 'Sage', 'Earthy', 'Muted'],
    neutral: ['Minimalist', 'Zen', 'Nordic', 'Calm', 'Serene']
  }

  const hueNames = {
    'Reds': ['Romance', 'Sunset', 'Rose Garden', 'Cherry Blossom', 'Fire'],
    'Oranges': ['Autumn', 'Tangerine Dream', 'Peachy Keen', 'Citrus', 'Warmth'],
    'Yellows': ['Sunshine', 'Lemonade', 'Golden', 'Butter', 'Honey'],
    'Greens': ['Forest', 'Matcha', 'Garden', 'Mint', 'Nature'],
    'Cyans': ['Ocean', 'Aqua', 'Tropical', 'Poolside', 'Lagoon'],
    'Blues': ['Sky', 'Denim', 'Sapphire', 'Ocean Depth', 'Indigo'],
    'Purples': ['Lavender', 'Galaxy', 'Plum', 'Mystic', 'Orchid'],
    'Spectrum': ['Rainbow', 'Kaleidoscope', 'Carnival', 'Festival', 'Prism']
  }

  // 랜덤 선택 함수
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

  // 명도 카테고리 결정
  let lightnessCategory
  if (avgLightness > 80) {
    lightnessCategory = lightnessNames.veryBright
  } else if (avgLightness > 60) {
    lightnessCategory = lightnessNames.bright
  } else if (avgLightness > 45) {
    lightnessCategory = lightnessNames.medium
  } else if (avgLightness > 25) {
    lightnessCategory = lightnessNames.deep
  } else {
    lightnessCategory = lightnessNames.dark
  }

  // 채도 카테고리 결정
  let saturationCategory
  if (avgSaturation > 65) {
    saturationCategory = saturationNames.vivid
  } else if (avgSaturation > 40) {
    saturationCategory = saturationNames.rich
  } else if (avgSaturation > 20) {
    saturationCategory = saturationNames.muted
  } else {
    saturationCategory = saturationNames.neutral
  }

  // 색상 카테고리
  const hueCategory = hueNames[dominantHueRange] || hueNames['Spectrum']

  // 이름 조합 (50% 확률로 형용사 + 색상, 50% 확률로 색상만)
  const useAdjective = Math.random() > 0.3
  let name = ''

  if (useAdjective) {
    // 명도 또는 채도 형용사 중 하나 선택
    const useLight = Math.random() > 0.5
    const adjective = useLight ? pickRandom(lightnessCategory) : pickRandom(saturationCategory)
    name = `${adjective} ${pickRandom(hueCategory)}`
  } else {
    name = pickRandom(hueCategory)
  }

  return name
}

/**
 * 주요 색상 범위 판단
 * @param {Array} hues - 색상(Hue) 배열 (0-360)
 * @returns {string} 색상 범위 이름
 */
function getDominantHueRange(hues) {
  // 색상 범위별로 개수 세기
  const ranges = {
    'Reds': 0,        // 0-30, 330-360
    'Oranges': 0,     // 30-60
    'Yellows': 0,     // 60-90
    'Greens': 0,      // 90-150
    'Cyans': 0,       // 150-210
    'Blues': 0,       // 210-270
    'Purples': 0,     // 270-330
    'Pastels': 0      // 무채색에 가까운 색상
  }

  for (const hue of hues) {
    if (hue >= 330 || hue < 30) {
      ranges['Reds']++
    } else if (hue >= 30 && hue < 60) {
      ranges['Oranges']++
    } else if (hue >= 60 && hue < 90) {
      ranges['Yellows']++
    } else if (hue >= 90 && hue < 150) {
      ranges['Greens']++
    } else if (hue >= 150 && hue < 210) {
      ranges['Cyans']++
    } else if (hue >= 210 && hue < 270) {
      ranges['Blues']++
    } else if (hue >= 270 && hue < 330) {
      ranges['Purples']++
    }
  }

  // 가장 많은 색상 범위 찾기
  let maxCount = 0
  let dominantRange = 'Spectrum'

  for (const [range, count] of Object.entries(ranges)) {
    if (count > maxCount) {
      maxCount = count
      dominantRange = range
    }
  }

  // 다양한 색상이 섞여있으면 'Spectrum'
  const nonZeroRanges = Object.values(ranges).filter(count => count > 0).length
  if (nonZeroRanges >= 4) {
    return 'Spectrum'
  }

  return dominantRange
}
