# 01. 업로드 페이지 구현

## 개요
사용자가 2025년의 추억 사진 20-30장을 업로드할 수 있는 페이지입니다.

## 구현 파일
- `src/components/UploadPage.jsx` - 업로드 페이지 컴포넌트
- `src/styles/UploadPage.css` - 업로드 페이지 스타일

## 주요 기능

### 1.1 업로드 버튼 및 파일 선택 (Task 1.1)

#### 구현 내용
```jsx
<input
  ref={fileInputRef}
  type="file"
  multiple
  accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
  onChange={handleFileSelect}
  style={{ display: 'none' }}
  capture="environment"
/>
```

**핵심 속성:**
- `type="file"` - 파일 선택 input
- `multiple` - 다중 파일 선택 가능
- `accept` - 허용할 파일 타입 지정
- `capture="environment"` - 모바일에서 카메라/갤러리 직접 접근

**UI 버튼:**
```jsx
<button
  className="upload-button"
  onClick={handleUploadClick}
  disabled={isUploadDisabled}
>
  {selectedFiles.length === 0 ? '사진 선택하기' : '사진 추가하기'}
</button>
```
- 파일 없을 때: "사진 선택하기"
- 파일 있을 때: "사진 추가하기"
- 30장 도달 시: disabled 상태

**썸네일 그리드 (3열 레이아웃):**
```css
.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}
```
- CSS Grid 사용
- 3개 열, 동일 너비
- 정사각형 비율 (aspect-ratio: 1)

---

### 1.2 iOS/Android 갤러리 접근 권한 UX 대응 (Task 1.2)

#### 구현 내용
```jsx
<input
  capture="environment"
  accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
/>
```

**핵심 포인트:**
1. **capture 속성**: 모바일에서 카메라/갤러리 바로 접근
   - `environment` - 후면 카메라 우선
   - iOS Safari, Android Chrome 모두 지원

2. **accept 속성**:
   - MIME type + 확장자 모두 명시
   - 일부 브라우저는 MIME만, 일부는 확장자만 인식
   - 최대 호환성을 위해 둘 다 포함

3. **모바일 최적화**:
   - viewport 설정으로 확대/축소 방지 (index.html)
   - 16px 이상 폰트로 iOS auto-zoom 방지

---

### 1.3 20장 미만 업로드 시 경고 문구 (Task 1.3)

#### 구현 내용
```jsx
// 20장 미만 경고
if (totalFiles.length < MIN_IMAGES) {
  setErrorMessage(`${MIN_IMAGES}장 미만은 정확한 분석이 어려워요. 최소 ${MIN_IMAGES}장을 업로드해주세요.`)
}
```

**UI 표시:**
```jsx
{errorMessage && (
  <div className={`message ${selectedFiles.length < MIN_IMAGES ? 'message-warning' : 'message-error'}`}>
    {errorMessage}
  </div>
)}
```

**스타일:**
- 경고(warning): 노란색 배경 (#FFF3CD)
- 에러(error): 빨간색 배경 (#F8D7DA)
- 중앙 정렬, 부드러운 border-radius

**동작:**
- 파일 선택/삭제 시마다 자동 체크
- 20장 미만이면 경고 표시
- 20장 이상이면 경고 자동 제거

---

### 1.4 30장 초과 선택 시 추가 선택 불가 (Task 1.4)

#### 구현 내용
```jsx
// 30장 초과 제한
if (totalFiles.length > MAX_IMAGES) {
  const remainingSlots = MAX_IMAGES - selectedFiles.length
  setErrorMessage(`최대 ${MAX_IMAGES}장까지만 업로드 가능합니다. (${remainingSlots}장 추가 가능)`)
  return
}
```

**업로드 버튼 비활성화:**
```jsx
const isUploadDisabled = selectedFiles.length >= MAX_IMAGES

<button
  onClick={handleUploadClick}
  disabled={isUploadDisabled}
>
```

**동작 흐름:**
1. 현재 파일 수 체크
2. 30장 도달 시 버튼 비활성화
3. 추가 선택 시도 시 에러 메시지
4. 남은 슬롯 수 안내

---

### 1.5 지원 포맷 검증 (Task 1.5)

#### 구현 내용
```jsx
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']

const validateFileFormat = (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const isValidType = ALLOWED_FORMATS.includes(file.type)
  const isValidExtension = ['jpg', 'jpeg', 'png', 'heic', 'heif'].includes(fileExtension)

  return isValidType || isValidExtension
}
```

**검증 로직:**
1. **MIME type 체크**: `file.type`
2. **확장자 체크**: `file.name`에서 추출
3. **OR 조건**: 둘 중 하나만 맞아도 통과

**이중 체크가 필요한 이유:**
- HEIC/HEIF는 브라우저별로 MIME type 인식이 다름
- Safari는 `image/heic`, Chrome은 빈 문자열로 인식할 수 있음
- 확장자도 함께 체크하여 호환성 확보

**에러 처리:**
```jsx
const invalidFiles = files.filter(file => !validateFileFormat(file))
if (invalidFiles.length > 0) {
  setErrorMessage(`지원하지 않는 파일 형식입니다. JPG, PNG, HEIC, HEIF 파일만 업로드 가능합니다.`)
  return
}
```

---

### 1.6 업로드 버튼 disabled 조건 (Task 1.6)

#### 구현 내용
```jsx
// 업로드 버튼 disabled
const isUploadDisabled = selectedFiles.length >= MAX_IMAGES

// 분석 버튼 disabled
const isAnalyzeDisabled = selectedFiles.length < MIN_IMAGES
```

**조건 정리:**

| 버튼 | Disabled 조건 | 이유 |
|------|--------------|------|
| 업로드 버튼 | `selectedFiles.length >= 30` | 최대 30장 제한 |
| 분석 버튼 | `selectedFiles.length < 20` | 최소 20장 필요 |

**CSS 스타일:**
```css
.upload-button:disabled {
  background-color: #CCCCCC;
  cursor: not-allowed;
  box-shadow: none;
}
```
- 회색 배경으로 비활성화 상태 표시
- cursor: not-allowed로 클릭 불가 표시
- 그림자 제거로 평면화

---

## 상태 관리

### State 구조
```jsx
const [selectedFiles, setSelectedFiles] = useState([])      // File 객체 배열
const [previewUrls, setPreviewUrls] = useState([])          // Blob URL 배열
const [errorMessage, setErrorMessage] = useState('')        // 에러/경고 메시지
const fileInputRef = useRef(null)                           // File input 참조
```

### 미리보기 URL 관리
```jsx
// URL 생성
const newPreviewUrls = files.map(file => URL.createObjectURL(file))

// URL 해제 (메모리 누수 방지)
URL.revokeObjectURL(previewUrls[index])
```

**주의사항:**
- `URL.createObjectURL`로 생성한 URL은 메모리에 남음
- 삭제 시 반드시 `revokeObjectURL` 호출 필요
- 메모리 누수 방지

---

## UI/UX 개선 사항

### 1. 버튼 인터랙션
```css
.upload-button:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(209, 82, 74, 0.3);
}

.upload-button:active:not(:disabled) {
  transform: scale(1.03);
}
```
- Hover: 미세한 확대 + 그림자 강화
- Active: 약간 더 확대 (버튼을 누른 느낌)
- Disabled 시 효과 없음

### 2. 썸네일 삭제 버튼
```jsx
<button className="thumbnail-remove" onClick={() => handleRemoveImage(index)}>
  ×
</button>
```
```css
.thumbnail-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
}
```
- 우상단에 위치
- 반투명 검은 배경
- Hover 시 불투명도 증가
- Active 시 빨간색으로 변경

### 3. Sticky 분석 버튼
```css
.analyze-section {
  position: sticky;
  bottom: var(--spacing-lg);
  background: linear-gradient(to top, var(--color-bg) 80%, transparent);
}
```
- 스크롤 시 하단에 고정
- 그라데이션 배경으로 자연스러운 오버레이

---

## 반응형 디자인

### 모바일 최적화 (max-width: 768px)
```css
@media (max-width: 768px) {
  .upload-title {
    font-size: 24px;
  }
  .thumbnail-grid {
    gap: 6px;
  }
}
```

### 작은 모바일 (max-width: 375px)
```css
@media (max-width: 375px) {
  .upload-title {
    font-size: 22px;
  }
  .thumbnail-grid {
    gap: 4px;
  }
}
```

---

## 다음 단계 예고

현재는 `handleAnalyze` 함수에서 console.log만 출력합니다:
```jsx
const handleAnalyze = () => {
  if (selectedFiles.length >= MIN_IMAGES && selectedFiles.length <= MAX_IMAGES) {
    // TODO: 다음 단계 (분석 페이지로 이동)
    console.log('분석 시작:', selectedFiles.length, '장')
  }
}
```

**향후 구현 사항:**
1. 로딩 페이지로 전환
2. 이미지 파일을 분석 API로 전송
3. 컬러 분석 결과 수신
4. 결과 페이지로 이동

---

## 테스트 체크리스트

- [x] 파일 선택 input 동작 확인
- [x] 다중 파일 선택 가능
- [x] 20장 미만 경고 표시
- [x] 30장 초과 시 추가 불가
- [x] 포맷 검증 (jpg, png, heic, heif)
- [x] 업로드 버튼 disabled 동작
- [x] 분석 버튼 disabled 동작
- [x] 썸네일 그리드 3열 레이아웃
- [x] 개별 이미지 삭제 기능
- [x] 반응형 디자인 (모바일)
- [x] iOS/Android 갤러리 접근

---

## 알려진 이슈 및 제한사항

### HEIC/HEIF 브라우저 호환성
- **문제**: 일부 브라우저(특히 Chrome)는 HEIC/HEIF 미리보기 불가
- **현재 대응**: 파일 선택은 가능, 미리보기만 표시 안 됨
- **향후 개선**: 서버에서 변환 또는 heic2any 라이브러리 사용

### 메모리 사용량
- **문제**: 30장의 고해상도 이미지 업로드 시 메모리 부담
- **현재 대응**: Blob URL 사용으로 최소화
- **향후 개선**: 썸네일 생성 시 리사이징 적용

---

## 성능 최적화 포인트

1. **Blob URL 사용**: 이미지를 base64로 변환하지 않고 Blob URL 사용
2. **메모리 관리**: 삭제 시 `revokeObjectURL` 호출
3. **CSS Grid**: Flexbox 대신 Grid로 레이아웃 최적화
4. **조건부 렌더링**: 필요한 요소만 DOM에 추가
