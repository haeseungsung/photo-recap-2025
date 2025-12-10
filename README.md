<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 2025 Colors

사용자가 업로드한 사진을 기반으로 **Top 2 Key Colors + 대표 사진**을 자동 생성해 2025년의 감성 톤을 시각적으로 정리해주는 AI Studio 앱입니다.

## 프로젝트 개요

- **목표**: 사진에서 주요 컬러와 대표 사진을 추출하여 Pantone 스타일의 결과 생성
- **디자인 톤**: 컬러 기반 / 감성적 / 미니멀 / 모바일 최적화
- **기술 스택**: React 19 + TypeScript + Vite 6 + Gemini API

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

## 프로젝트 구조

```
instagram/
├── components/           # React 컴포넌트 (TypeScript)
│   ├── IntroPage.tsx
│   ├── LoadingPage.tsx
│   ├── ResultPage.tsx
│   └── UploadPage.tsx
├── services/            # API 서비스
│   └── geminiService.ts
├── utils/               # 유틸리티 함수
│   └── colorUtils.ts
├── App.tsx              # 메인 앱 컴포넌트
├── index.tsx            # 진입점
├── types.ts             # TypeScript 타입 정의
├── vite.config.ts       # Vite 설정
└── tsconfig.json        # TypeScript 설정
```

## 주요 기능

- **사진 업로드**: 여러 장의 사진을 업로드하여 분석
- **AI 분석**: Gemini API를 사용한 색상 및 감성 분석
- **결과 시각화**: Pantone 스타일의 아름다운 결과 페이지
- **공유 기능**: 결과를 이미지로 저장 및 공유

## 기술 스택

- React 19
- TypeScript
- Vite 6
- Framer Motion (애니메이션)
- Gemini API (AI 분석)
- Lucide React (아이콘)
- html2canvas (이미지 캡처)
