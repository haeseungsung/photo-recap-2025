# 📱 2025 Recap — Mobile Web PRD  
### ⭐ Final Complete Version (with Auto Color Naming, Pantone-style Result, Color Picker Loader)

---

# 1. 🎯 Goal & Experience Tone

## Goal  
사용자가 업로드한 사진(20–30장)을 기반으로  
**Top 2 Key Colors + 4~6장의 대표 사진**을 자동 생성해  
2025년의 감성 톤을 시각적으로 정리해주는 모바일 리캡 서비스.

## Experience Tone  
- 컬러 기반 / 감성적 / 따뜻한 연말 톤  
- Pantone 스타일의 고급스럽고 미니멀한 시각  
- 부드러운 애니메이션  
- 모바일 최적화 / 직관적 UI

---

# 2. 👣 User Flow Perception

1. **인트로 페이지 진입**  
   → "What is the color of your 2025"  
   → Find Out 클릭

2. **사진 업로드 (20~30장 제한)**  
   - 20장 미만 업로드 시 경고:  
     **“20장 미만은 정확한 분석이 어려워요. 최소 20장을 업로드해주세요.”**  
   - 30장 초과는 업로드 불가(버튼 disabled)

3. **분석 로딩 페이지**  
   - Color Picker UI 등장  
   - Auto-moving selector가 5회 이상 움직이는 연출  
   - 최소 3초 이상 로딩 유지  
   - 문구 순차 출력  
     - “Analyzing your colors now…”  
     - “Scanning your moments…”  
     - “Extracting key tones…”  
     - “Finding your 2025 palette…”

4. **결과 페이지**  
   - Pantone 스타일 구성  
   - 시스템이 자동 생성한 컬러 네이밍 + HEX 코드 표시  
   - 대표 사진 4~6장 배치  
   - 클러스터 A/B 컬러 기반 레이아웃  
   - 상세보기 페이지 없음

5. **공유 페이지**  
   - Top2 Key Colors + 대표사진 4~6장으로 구성된 이미지 Export  
   - 다운로드 & SNS 공유 지원

---

# 3. 🖼 UI/UX 스타일 가이드

---

## 3-1. Intro Page

### Background  
- 파스텔 그라데이션 + 노이즈  
- 퍼플 → 코랄 → 옐로우 → 블루 흐름  
- 매우 부드러운 Blur gradient

### Typography  
- “What is the” → 세리프 · 24–28px  
- “color” → 픽셀(8bit) 스타일  
- “your” → cursive  
- “2025” → 세리프, 가장 강조(48–64px)

### CTA Button  
- muted red (#D1524A)  
- 곡률 8–12px  
- Press: scale(1.03)  
- idle: breathing animation

---

## 3-2. Upload Page
- 헤더: “Upload your 2025 moments”  
- 3열 썸네일 그리드  
- 20–30장 업로드 가능  
- 20 미만 → 경고 표시  
- 30 초과 → 추가 선택 제한  
- 썸네일 라운드 10px

---

## 3-3. 분석 로딩 페이지 (Color Picker Motion)

### Background  
- 인트로 그라데이션 유지하되 더 섬세한 흐름  
- 업로드 이미지 dominant color 일부 반영

### Color Picker UI  
- Pantone/Procreate 스타일의 컬러 모달 형태  
- 20×10 색상 매트릭스  
- Rounded Corner 12–16px  
- Selector 박스(화이트 테두리) 자동 이동  
- 최소 5회 이상 위치 변경  
- easing-in-out 곡선으로 자연스러운 모션  
- 잔상(trail) 가능

### Copy  
- 1.8~2.2초 간격으로 페이드 전환  
  1. “Analyzing your colors now…”  
  2. “Scanning your moments…”  
  3. “Extracting key tones…”  
  4. “Finding your 2025 palette…”

### Duration  
- **최소 3초 고정 (분석이 빨리 끝나도 3초 유지)**

### Transition  
- 마지막 스캔 후 → 컬러 피커가 축소되며 → 결과 페이지로 슬라이드 업

---

## 3-4. 결과 페이지 (Pantone 스타일)  
**아래 참고 이미지의 구성 방식 준수**

![Pantone Ref](첨부한 이미지 참고)

### Key Colors Section  
- 키컬러 2개는 Pantone 카드 스타일로 표현  
- 구성 요소:  
  - 자동 생성 컬러 이름(시스템 생성)  
  - HEX 코드  
  - 컬러칩(사각형, 1:1 비율)  
- 서체는 Pantone 카드 느낌의 산세리프

예시:  
- **Chocolate Brown — #3C2F2F**  
- **Delicate Blue — #C7D7EB**

### Photo Cluster Section  
- 대표 사진 4~6장  
- Pantone 예시처럼 **좌우 배치**  
- 컬러칩(키 컬러)과 이미지 레이아웃의 구조적 조화  
- 각 클러스터별 사진은 동일 톤끼리 묶임  
- 사진 라운드 8–12px  
- Margin & Padding 충분히 확보

### No Detail View  
- 사진 탭 → 확대 없음  
- Lightbox 없음  
- 단일 결과 화면만 존재

---

## 3-5. Share Page

### Export Image 구성  
- 키컬러 2개 (Pantone 카드 스타일 그대로)  
- 대표 사진 4장 또는 6장  
- 전체 비율: 1080×1920 (스토리 최적화)  
- 브랜드 워딩 optional:  
  - “Your 2025 Color Recap”  
  - “Created by [Service Name]”

### Export 방식  
- HTML → Canvas → PNG  
- Web Share API  
- 다운로드 지원

---

# 4. 💾 데이터 구조 & 처리 방식

### 입력  
20~30장의 사용자 이미지

### 색 분석 파이프라인  
1. Resize (512px)  
2. Dominant color 6~8개 추출  
3. 전체 분포에서 Top 2 컬러 선정 (LAB ΔE 거리 기반)  
4. 자동 컬러 네이밍 생성  
   - 색상군 기반 이름 + 감성 토큰 조합  
   - 예: “Soft Coral”, “Deep Walnut”, “Morning Fog”

### 클러스터링  
- 이미지별 대표색 1개 선정  
- Top2 Color와 LAB 거리 최소값으로 A/B 분류  
- 균형 맞춤 로직(2:8 같은 extreme 분포 방지)

### 대표 사진 선정  
- contrast + sharpness + vividness  
- 상위 4장 또는 6장 자동 선정

---

# 5. 🪜 Build Steps (체크리스트)

### A. Upload  
- [ ] 이미지 업로드(20~30 제한)  
- [ ] 썸네일 그리드  
- [ ] Validation 메시지

### B. Color Extraction  
- [ ] Dominant color 분석  
- [ ] LAB ΔE 기반 대표색 2개 선정  
- [ ] 자동 색 이름 생성  
- [ ] HEX 코드 생성

### C. Clustering  
- [ ] LAB distance 기반 A/B 배정  
- [ ] 대표 이미지 4~6선정

### D. UI/UX  
- [ ] Intro Page  
- [ ] Upload Page  
- [ ] Color Picker Loader (3초 이상, selector min 5 moves)  
- [ ] Pantone Style Result Page  
- [ ] Share Page (Export Canvas)

### E. Export  
- [ ] Canvas(1080×1920)  
- [ ] Download 버튼  
- [ ] SNS Share

---

# 6. ⚠️ 제약조건

- Web Share API 미지원 브라우저 존재  
- 사진 용량이 클 경우 처리 속도 늦어짐  
- 모바일 메모리 이슈(30장 업로드 시)  
- 컬러 이름 자동 생성 정확도 튜닝 필요

---

# 7. 📦 산출물

- PRD.md (본 문서)  
- 와이어프레임(요청 시)  
- 컬러 분석 알고리즘 명세(옵션)  
- 개발용 스타일 토큰 세트 등

---

# ✔ End of Final PRD
필요하면 **Pantone 스타일 결과 페이지의 정확한 와이어프레임**도 만들어줄게!  
혹은 **자동 컬러 네이밍 규칙표**도 제작 가능해.
