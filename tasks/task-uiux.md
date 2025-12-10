# 📄 /tasks/tasks-ui-ux.md
### **UI/UX Implementation — Full Task List (JS/JSX Version)**

---

## Relevant Files

- `app/pages/IntroPage.jsx`  
  - 인트로 페이지 UI 및 애니메이션.

- `app/pages/UploadPage.jsx`  
  - 업로드 UI(20~30 제한, 썸네일 그리드).

- `app/pages/LoaderPage.jsx`  
  - Color Picker Loader (3초 이상, selector 최소 5회 이동).

- `app/pages/ResultPage.jsx`  
  - Pantone 스타일 키 컬러 + 대표 이미지 결과 페이지.

- `app/pages/SharePage.jsx`  
  - Export Canvas + 공유 UI.

- `components/Button.jsx`  
  - 공통 CTA 버튼.

- `components/ColorChip.jsx`  
  - 결과 페이지에서 사용하는 팬톤 스타일 컬러칩.

- `components/AutoColorPicker.jsx`  
  - 로딩 애니메이션용 컬러 피커 UI.

- `components/ResultCard.jsx`  
  - 대표 이미지 + 컬러칩 조합 카드.

- `lib/export/renderToCanvas.js`  
  - 결과 페이지 → PNG로 렌더하는 함수.

- `lib/export/useExport.js`  
  - 공유/다운로드 기능 Hook.

- `public/fonts/*`  
  - 인트로 페이지용 Serif, Pixel, Cursive 폰트.

---

### Notes

- LoaderPage는 분석 결과가 빨라도 **3초 고정 + Selector 최소 5회 이동**  
- Result Page는 반드시 **Pantone 스타일 레이아웃** 유지  
- Export 이미지는 기본 1080×1920  
- 모든 UI는 모바일 레이아웃 기준(375px)

---

# ✅ Tasks — UI/UX (JS/JSX Implementation)

---

## **0.0 Create feature branch**
- [ ] **0.1 Create and checkout a new branch**  
      `git checkout -b feature/ui-ux`

---

## **1.0 Implement Intro Page**
- [ ] 1.1 `IntroPage.jsx` 생성  
- [ ] 1.2 배경 그라데이션 + 노이즈 텍스처 구현  
- [ ] 1.3 “What is the / color of your / 2025” 타이포 조합 반영  
- [ ] 1.4 Pixel / Cursive / Serif 폰트 import  
- [ ] 1.5 Find Out CTA 버튼 구현(Button.jsx 사용)  
- [ ] 1.6 초기 fade-in + subtle motion 애니메이션  
- [ ] 1.7 CTA 클릭 시 UploadPage로 라우팅 처리

---

## **2.0 Implement Upload Page**
- [ ] 2.1 `UploadPage.jsx` 생성  
- [ ] 2.2 업로드 버튼 + `<input type="file" multiple>` 구현  
- [ ] 2.3 20장 미만 경고 메시지 UI  
- [ ] 2.4 30장 초과 선택 방지  
- [ ] 2.5 3열 썸네일 그리드 UI  
- [ ] 2.6 썸네일 삭제 버튼(X 아이콘)  
- [ ] 2.7 업로드 조건(20장 이상) 충족 시 CTA 활성화  
- [ ] 2.8 모바일 기준 spacing & layout 적용

---

## **3.0 Implement Color Picker Loader**
(3초 이상 + Selector 최소 5회 이동)

- [ ] 3.1 `LoaderPage.jsx` 생성  
- [ ] 3.2 컬러 매트릭스 UI 구성 (20×10 grid)  
- [ ] 3.3 Selector 박스 컴포넌트(화이트 경계선)  
- [ ] 3.4 Selector auto movement 구현(easing, min 5 moves)  
- [ ] 3.5 최소 duration 3000ms 보장  
- [ ] 3.6 문구 순차 표시:  
      “Analyzing…” → “Scanning…” → “Extracting…” → “Finding palette…”  
- [ ] 3.7 분석 완료 신호 수신 → 결과 페이지로 이동  
- [ ] 3.8 페이지 전환 애니메이션(Fade-out → Slide-up)

---

## **4.0 Implement Pantone Style Result Page**
- [ ] 4.1 `ResultPage.jsx` 생성  
- [ ] 4.2 Pantone-style ColorChip 컴포넌트 구축  
  - 자동 생성 색 이름  
  - HEX 코드  
  - 컬러칩 박스  
- [ ] 4.3 대표 이미지 4–6장 UI 구성  
- [ ] 4.4 Pantone 스타일 시각 구조 재현(좌/우 구조)  
- [ ] 4.5 반응형 spacing / alignment 보정  
- [ ] 4.6 이미지 상세보기 없음(클릭 무반응)  
- [ ] 4.7 “Share Recap” CTA → SharePage로 이동

---

## **5.0 Implement Share Page (Export Canvas)**
- [ ] 5.1 `SharePage.jsx` 생성  
- [ ] 5.2 결과 → Canvas 렌더링을 위한 `renderToCanvas.js` 구현  
- [ ] 5.3 1080×1920 캔버스 레이아웃 구성  
- [ ] 5.4 Pantone 카드 2개 + 대표 이미지 4–6장 배치  
- [ ] 5.5 PNG 저장 버튼  
- [ ] 5.6 Web Share API 적용(지원 브라우저에서만)  
- [ ] 5.7 공유 실패 fallback 처리

---

# 🎯 Instructions for Completing Tasks

각 sub-task 완료 시 반드시 체크박스를:

 3.1 Create loader page

Copy code

처럼에서

 3.1 Create loader page

yaml
Copy code

로 업데이트해야 함.

---

# ✔ End of File  
UI/UX 전체 페이지의 개발을 위한 공식 Task 문서입니다.