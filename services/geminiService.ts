import { ColorData } from "../types";

// HSL 변환 함수
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// 색상 분석 규칙
const analyzeColors = (colors: ColorData[]): { title: string; hashtags: string[] } => {
  const hslColors = colors.map(c => hexToHSL(c.hex));

  // 평균 명도, 채도, 색상 계산
  const avgLightness = hslColors.reduce((sum, c) => sum + c.l, 0) / hslColors.length;
  const avgSaturation = hslColors.reduce((sum, c) => sum + c.s, 0) / hslColors.length;

  // 색상 분포 분석
  const hasWarm = hslColors.some(c => (c.h >= 0 && c.h < 60) || c.h >= 300); // 빨강, 주황, 분홍
  const hasCool = hslColors.some(c => c.h >= 180 && c.h < 300); // 파랑, 보라
  const hasGreen = hslColors.some(c => c.h >= 60 && c.h < 180); // 초록, 청록
  const hasNeutral = hslColors.some(c => c.s < 15); // 회색톤

  // 명도 범위
  const isDark = avgLightness < 40;
  const isBright = avgLightness > 70;
  const isMedium = !isDark && !isBright;

  // 채도 분석
  const isVibrant = avgSaturation > 50;
  const isMuted = avgSaturation < 30;
  const isModerate = !isVibrant && !isMuted;

  // 팔레트 이름 및 해시태그 결정
  let adjective = "";
  let noun = "";
  let tags: string[] = [];

  // 명도 + 채도 조합으로 분위기 결정
  if (isDark && isMuted) {
    adjective = Math.random() > 0.5 ? "고요한" : "차분한";
    noun = Math.random() > 0.5 ? "밤" : "그림자";
    tags = ["#차분함", "#고요함", "#깊이감"];
  } else if (isDark && isVibrant) {
    adjective = Math.random() > 0.5 ? "신비로운" : "몽환적인";
    noun = Math.random() > 0.5 ? "밤하늘" : "우주";
    tags = ["#신비로움", "#몽환적", "#강렬함"];
  } else if (isBright && isMuted) {
    adjective = Math.random() > 0.5 ? "부드러운" : "따뜻한";
    noun = Math.random() > 0.5 ? "아침" : "햇살";
    tags = ["#따뜻함", "#부드러움", "#평온함"];
  } else if (isBright && isVibrant) {
    adjective = Math.random() > 0.5 ? "활기찬" : "생동감넘치는";
    noun = Math.random() > 0.5 ? "여름" : "축제";
    tags = ["#생동감", "#활기찬", "#경쾌함"];
  } else if (isMedium && isVibrant) {
    adjective = Math.random() > 0.5 ? "감성적인" : "열정적인";
    noun = Math.random() > 0.5 ? "순간" : "기억";
    tags = ["#감성적", "#열정적", "#생생함"];
  } else {
    adjective = Math.random() > 0.5 ? "자연스러운" : "편안한";
    noun = Math.random() > 0.5 ? "일상" : "휴식";
    tags = ["#자연스러움", "#편안함", "#일상적"];
  }

  // 색상 온도에 따른 추가 조정
  if (hasWarm && !hasCool) {
    if (Math.random() > 0.7) {
      adjective = "따뜻한";
      tags[0] = "#따뜻함";
    }
  } else if (hasCool && !hasWarm) {
    if (Math.random() > 0.7) {
      adjective = "시원한";
      tags[0] = "#시원함";
    }
  } else if (hasGreen) {
    if (Math.random() > 0.8) {
      adjective = "자연스러운";
      noun = "숲";
      tags = ["#자연스러움", "#싱그러움", "#편안함"];
    }
  }

  // 중성톤이 많으면
  if (hasNeutral && hslColors.filter(c => c.s < 15).length >= 3) {
    adjective = Math.random() > 0.5 ? "세련된" : "모던한";
    noun = Math.random() > 0.5 ? "도시" : "공간";
    tags = ["#세련됨", "#모던함", "#미니멀"];
  }

  return {
    title: `${adjective} ${noun} 팔레트`,
    hashtags: tags
  };
};

export const analyzePaletteWithGemini = async (colors: ColorData[]): Promise<{ title: string; hashtags: string[] }> => {
  // API 없이 알고리즘 기반 분석
  return analyzeColors(colors);
};