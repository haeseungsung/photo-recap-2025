# 00. 프로젝트 셋업

## 개요
2025 Color Recap 프로젝트의 초기 설정 문서입니다.

## 기술 스택

### 프론트엔드
- **React 18.3.1**: UI 라이브러리
- **Vite 6.0.1**: 빌드 도구 및 개발 서버
- **JavaScript (ES6+)**: 프로그래밍 언어

### 개발 환경
- Node.js 환경
- npm 패키지 매니저

## 프로젝트 구조

```
instagram/
├── dev-docs/              # 개발 문서
├── tasks/                 # 작업 체크리스트
├── src/                   # 소스 코드
│   ├── components/        # React 컴포넌트
│   ├── styles/           # CSS 스타일
│   ├── utils/            # 유틸리티 함수
│   ├── App.jsx           # 메인 App 컴포넌트
│   └── main.jsx          # 진입점
├── index.html            # HTML 템플릿
├── vite.config.js        # Vite 설정
├── package.json          # 의존성 관리
├── prd.md                # 프로덕트 요구사항 문서
└── .gitignore            # Git 제외 파일
```

## CSS 변수 (Design Tokens)

프로젝트에서 사용하는 디자인 토큰은 `src/styles/index.css`에 정의되어 있습니다:

### 컬러
- `--color-primary: #D1524A` - 주요 브랜드 컬러 (muted red)
- `--color-bg: #FAFAFA` - 배경색
- `--color-text: #1A1A1A` - 기본 텍스트
- `--color-text-muted: #666666` - 보조 텍스트
- `--color-error: #E74C3C` - 에러 메시지
- `--color-success: #27AE60` - 성공 메시지
- `--color-border: #E0E0E0` - 테두리

### 간격 (Spacing)
- `--spacing-xs: 4px`
- `--spacing-sm: 8px`
- `--spacing-md: 16px`
- `--spacing-lg: 24px`
- `--spacing-xl: 32px`
- `--spacing-2xl: 48px`

### Border Radius
- `--radius-sm: 8px`
- `--radius-md: 10px`
- `--radius-lg: 12px`

## 모바일 최적화

### Viewport 설정
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```
- 모바일 디바이스에서 확대/축소 방지
- 반응형 레이아웃 지원

### iOS Safari 대응
```css
input, select, textarea {
  font-size: 16px;
}
```
- iOS에서 input focus 시 자동 줌 방지를 위해 최소 16px 폰트 사이즈 사용

## 개발 서버 실행

```bash
npm run dev
```
- 포트: 3000
- 자동 브라우저 열기 활성화

## 빌드

```bash
npm run build
```
- 프로덕션 빌드 생성
- 결과물: `dist/` 폴더

## Git 초기화

```bash
git init
git checkout -b main
```
- Git 저장소 초기화 완료
- main 브랜치에서 작업 시작

## 다음 단계

1.0 단계: 이미지 업로드 UI 및 제한사항 구현
- 업로드 페이지 컴포넌트 개발
- 파일 선택 및 검증 로직 구현
