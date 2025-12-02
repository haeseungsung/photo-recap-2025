# 2025 Color Recap

사용자가 업로드한 사진을 기반으로 **Top 2 Key Colors + 대표 사진**을 자동 생성해 2025년의 감성 톤을 시각적으로 정리해주는 모바일 리캡 서비스입니다.

## 프로젝트 개요

- **목표**: 20-30장의 사진에서 주요 컬러 2개와 대표 사진 4-6장을 추출하여 Pantone 스타일의 결과 생성
- **디자인 톤**: 컬러 기반 / 감성적 / 미니멀 / 모바일 최적화
- **기술 스택**: React 18 + Vite 6

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
instagram/
├── dev-docs/              # 개발 문서
│   ├── 00-project-setup.md
│   └── 01-upload-page.md
├── tasks/                 # 작업 체크리스트
│   └── task1202.md
├── src/
│   ├── components/        # React 컴포넌트
│   │   └── UploadPage.jsx
│   ├── styles/           # CSS 스타일
│   │   ├── index.css
│   │   ├── App.css
│   │   └── UploadPage.css
│   ├── utils/            # 유틸리티 (추후)
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── prd.md                # 프로덕트 요구사항 문서
└── README.md
```

## 개발 진행 상황

### ✅ 완료된 단계

#### 0.0 Git 초기화
- [x] Git 저장소 초기화
- [x] main 브랜치에서 작업 시작

#### 1.0 이미지 업로드 UI 및 제한사항 구현
- [x] 1.1 업로드 버튼 및 다중 파일 선택
- [x] 1.2 iOS/Android 갤러리 접근 UX 대응
- [x] 1.3 20장 미만 경고 문구
- [x] 1.4 30장 초과 선택 제한
- [x] 1.5 파일 포맷 검증 (jpg, jpeg, png, heic, heif)
- [x] 1.6 업로드 버튼 disabled 조건

### 📋 향후 단계

- [ ] 2.0 분석 로딩 페이지 (Color Picker UI)
- [ ] 3.0 컬러 추출 알고리즘
- [ ] 4.0 결과 페이지 (Pantone 스타일)
- [ ] 5.0 공유 기능

## 주요 기능

### 업로드 페이지
- **파일 선택**: 20-30장의 사진 업로드
- **썸네일 그리드**: 3열 레이아웃으로 미리보기
- **유효성 검사**:
  - 최소 20장, 최대 30장 제한
  - 지원 포맷: JPG, PNG, HEIC, HEIF
  - 실시간 경고/에러 메시지
- **모바일 최적화**:
  - 갤러리 직접 접근
  - 반응형 디자인
  - iOS/Android 호환

## 개발 문서

상세한 개발 내용은 `dev-docs/` 폴더를 참고하세요:

- [00-project-setup.md](dev-docs/00-project-setup.md) - 프로젝트 셋업 가이드
- [01-upload-page.md](dev-docs/01-upload-page.md) - 업로드 페이지 구현 상세

## 디자인 토큰

```css
/* 컬러 */
--color-primary: #D1524A     /* Muted Red */
--color-bg: #FAFAFA          /* 배경 */
--color-text: #1A1A1A        /* 텍스트 */

/* 간격 */
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px

/* Border Radius */
--radius-sm: 8px
--radius-md: 10px
--radius-lg: 12px
```

## 브라우저 지원

- iOS Safari 15+
- Chrome (Android) 90+
- Chrome (Desktop) 90+
- Safari (Desktop) 15+

## 라이선스

Private Project
