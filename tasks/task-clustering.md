# 📄 /tasks/tasks-clustering.md
### **Clustering Feature — Full Task List (LAB Distance + Key Color Ratio Selection)**

---

## Relevant Files

- `lib/clustering/assignClusters.ts`  
  - LAB ΔE 거리 기반으로 각 이미지가 KeyColor A 또는 KeyColor B 중 어디에 가까운지 판단하는 로직.

- `lib/clustering/assignClusters.test.ts`  
  - 클러스터 배정 테스트 (LAB 값, ΔE 비교 등).

- `lib/clustering/selectRepresentativeImages.ts`  
  - 두 Key Color에 대한 포함 비율 기반으로 대표 이미지(4~6장) 선정.

- `lib/clustering/selectRepresentativeImages.test.ts`  
  - 대표 이미지 선정 로직 테스트.

- `lib/types/ClusterResult.ts`  
  - { clusterA: [...], clusterB: [...], representatives: [...] } 구조 정의.

- `lib/color/calculateLabDeltaE.ts`  
  - LAB ΔE 거리 계산 모듈(이미 존재).  
  - 클러스터 배정에서 사용.

---

### Notes

- 대표 이미지 선정 기준:  
  **각 이미지의 dominant color distribution 중 Top2 Key Colors가 차지하는 비율이 높은 순으로 정렬 → 상위 4~6장 선택**
- LAB 거리는 ΔE2000 사용.
- 클러스터 결과는 결과 페이지 구성에 직접 연결됨.

---

# ✅ Tasks — Clustering

---

## **0.0 Create feature branch**
- [ ] **0.1 Create and checkout a new branch**  
      `git checkout -b feature/clustering`

---

## **1.0 Implement LAB distance–based A/B cluster assignment**
- [ ] 1.1 `assignClusters.ts` 생성  
- [ ] 1.2 각 이미지의 dominant color(1개 또는 multiple) 준비  
- [ ] 1.3 이미지 대표색과 KeyColor A/B LAB 값 비교  
- [ ] 1.4 ΔE2000 계산하여 더 가까운 컬러를 선택  
- [ ] 1.5 clusterA / clusterB 리스트에 이미지 push  
- [ ] 1.6 유사거리(ΔE 차이 매우 작을 경우) tie-breaker 룰 적용  
- [ ] 1.7 assignClusters 테스트 코드 작성

---

## **2.0 Compute per-image KeyColor ratio**
(대표 이미지 선정을 위한 준비 단계)

- [ ] 2.1 각 이미지의 dominant color list 가져오기  
- [ ] 2.2 dominant color들이 KeyColor A와 얼마나 가까운지 수치화  
- [ ] 2.3 dominant color 비율 × 유사도 가중 방식으로 점수 생성  
- [ ] 2.4 두 Key Colors 기준 각각의 포함 비율 계산  
- [ ] 2.5 이미지별 "KeyColor Presence Score" 구조 생성  
    예시:  
    ```
    {
      imageId: "...",
      scoreA: 0.73,
      scoreB: 0.55
    }
    ```

---

## **3.0 Select representative images (4~6 images)**
- [ ] 3.1 `selectRepresentativeImages.ts` 파일 생성  
- [ ] 3.2 image.scoreA + image.scoreB 총합 기반으로 정렬  
- [ ] 3.3 상위 4~6장 자동 선택  
- [ ] 3.4 클러스터 A/B별 균형 잡힌 선택 optional 적용  
- [ ] 3.5 대표 이미지 데이터 구조 생성  
- [ ] 3.6 테스트 작성 (비율이 높은 이미지가 정확히 상위로 나오는지 검증)

---

## **4.0 Create final clustering output structure**
- [ ] 4.1 `ClusterResult` 타입 생성  
- [ ] 4.2 구조 예시:
{
clusterA: [...imageIds],
clusterB: [...imageIds],
representatives: [...top4to6]
}

yaml
Copy code
- [ ] 4.3 상위 단계(결과 페이지)로 전달될 pipeline 연결  
- [ ] 4.4 통합 테스트(optional)

---

# 🎯 Instructions for Completing Tasks

작업할 때마다 반드시 체크 표시를 업데이트해야 한다:

 1.1 Create file
→

 1.1 Create file

yaml
Copy code

---

# ✔ End of File  
Clustering 기능(Task C)을 위한 공식 Task 문서입니다.

다음 스텝도 만들어줄까?  
- `/tasks/tasks-loading-animation.md`  
- `/tasks/tasks-result-page.md`  
- `/tasks/tasks-export-share.md`