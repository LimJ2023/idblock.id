# 얼굴 비교 정확성 테스트 가이드

이 문서는 Argos API의 `argosFaceCompare` 함수의 정확성을 테스트하는 방법을 설명합니다.

## 📋 개요

여권 이미지와 여러 장의 테스트 이미지를 비교하여 얼굴 인식 정확도를 측정하고 분석하는 테스트 도구입니다.

## 🔧 테스트 유형

1. **Jest 기반 유닛 테스트**: Mock 데이터를 사용한 기본 테스트
2. **실제 이미지 테스트**: 실제 이미지 파일을 사용한 정확성 검증
3. **CLI 스크립트**: 명령행에서 실행 가능한 테스트 도구

## 📁 테스트 파일 구조

### Jest 테스트

- `src/user/user.service.spec.ts`: Mock 데이터를 사용한 기본 테스트

### 실제 이미지 테스트

- `src/user/face-compare-test.util.ts`: 실제 이미지 테스트 유틸리티
- `scripts/test-face-compare.ts`: CLI 실행 스크립트

## 🚀 사용법

### 1. Jest 유닛 테스트 실행

```bash
# 전체 테스트 실행
pnpm test

# 얼굴 비교 테스트만 실행
pnpm test user.service.spec.ts

# 커버리지와 함께 실행
pnpm test:cov
```

### 2. 실제 이미지로 테스트 실행

#### 준비사항

1. **테스트 이미지 준비**

   ```
   test-images/
   ├── passport.jpg                 # 기준이 되는 여권 이미지
   └── faces/                       # 비교할 얼굴 이미지들
       ├── match_person1_1.jpg      # 일치하는 이미지들
       ├── match_person1_2.jpg
       ├── match_person1_3.jpg
       ├── nomatch_person2_1.jpg    # 일치하지 않는 이미지들
       ├── nomatch_person2_2.jpg
       └── nomatch_person3_1.jpg
   ```

2. **파일명 규칙**
   - `match_*`: 여권 이미지와 **일치하는** 얼굴 (같은 사람)
   - `nomatch_*`: 여권 이미지와 **일치하지 않는** 얼굴 (다른 사람)

#### 실행 명령어

```bash
# 기본 실행
pnpm test:face-compare ./test-images/passport.jpg ./test-images/faces/

# 결과를 파일로 저장
pnpm test:face-compare ./test-images/passport.jpg ./test-images/faces/ ./test-results.json
```

### 3. 프로그래밍 방식으로 사용

```typescript
import { UserService } from './src/user/user.service';
import { FaceCompareTestUtil } from './src/user/face-compare-test.util';

async function runTest() {
  const userService = /* UserService 인스턴스 */;
  const testUtil = new FaceCompareTestUtil(userService);

  const config = {
    passportImagePath: './test-images/passport.jpg',
    testImagesDirectory: './test-images/faces/',
    similarityThreshold: 0.7,
    outputPath: './results.json'
  };

  const summary = await testUtil.runFaceCompareTest(config);
  console.log(`정확도: ${summary.accuracy}%`);
}
```

## 📊 테스트 결과 해석

### 기본 지표

- **정확도 (Accuracy)**: 전체 예측 중 정확한 예측의 비율
- **정밀도 (Precision)**: 일치로 예측한 것 중 실제로 일치하는 비율
- **재현율 (Recall)**: 실제 일치하는 것 중 올바르게 찾아낸 비율
- **F1 Score**: 정밀도와 재현율의 조화평균

### Confusion Matrix

```
                 예측값
                일치   불일치
실제값  일치    TP    FN
       불일치   FP    TN
```

- **TP (True Positive)**: 올바르게 일치로 판단
- **FP (False Positive)**: 잘못 일치로 판단 (오탐)
- **TN (True Negative)**: 올바르게 불일치로 판단
- **FN (False Negative)**: 잘못 불일치로 판단 (놓침)

### 성능 평가 기준

| 정확도   | 평가    |
| -------- | ------- |
| 95% 이상 | 🌟 우수 |
| 90-94%   | 👍 양호 |
| 80-89%   | ⚠️ 보통 |
| 80% 미만 | ❌ 미흡 |

## 🔧 고급 사용법

### 1. 임계값 최적화

```typescript
const testUtil = new FaceCompareTestUtil(userService);
const thresholdResults = await testUtil.analyzeThresholdPerformance(
  config,
  [0.5, 0.6, 0.7, 0.8, 0.9],
);

// 최적 임계값 찾기
let bestThreshold = 0.7;
let bestF1Score = 0;
thresholdResults.forEach((summary, threshold) => {
  if (summary.f1Score > bestF1Score) {
    bestF1Score = summary.f1Score;
    bestThreshold = threshold;
  }
});
```

### 2. 대량 성능 테스트

```typescript
// 100장의 이미지로 성능 테스트
const performanceTest = await testUtil.runFaceCompareTest({
  passportImagePath: './passport.jpg',
  testImagesDirectory: './large-test-set/', // 100장의 이미지
  similarityThreshold: 0.7,
});

console.log(`평균 처리 시간: ${performanceTest.averageProcessingTime}ms`);
```

## 📝 테스트 시나리오 예시

### 시나리오 1: 기본 정확성 검증

- **목표**: 다양한 각도와 조명의 사진으로 기본 인식 성능 확인
- **이미지 구성**:
  - 일치 이미지 10장 (정면, 측면, 다른 조명 등)
  - 불일치 이미지 40장 (다른 사람들)

### 시나리오 2: 저품질 이미지 테스트

- **목표**: 흐릿하거나 해상도가 낮은 이미지에서의 성능 확인
- **이미지 구성**:
  - 저해상도, 흐림, 노이즈가 있는 이미지들

### 시나리오 3: 연령대별 테스트

- **목표**: 나이 차이가 있는 이미지들 간의 인식 성능 확인
- **이미지 구성**:
  - 같은 사람의 다른 연령대 사진들

## 🛠️ 문제 해결

### 일반적인 오류

1. **이미지 파일을 읽을 수 없음**

   ```
   Error: 이미지 파일을 읽을 수 없습니다: ./test.jpg
   ```

   - 파일 경로 확인
   - 파일 권한 확인
   - 지원되는 이미지 형식인지 확인 (jpg, jpeg, png, bmp)

2. **API 키 오류**

   ```
   Error: Failed to fetch Argos Face Compare
   ```

   - `.env` 파일에 `ARGOS_API_KEY` 설정 확인
   - API 키의 유효성 확인

3. **메모리 부족**
   - 한 번에 처리하는 이미지 수 줄이기
   - 이미지 크기 최적화

### 성능 최적화

1. **이미지 크기 최적화**

   ```typescript
   // Sharp를 사용한 이미지 리사이징
   const optimizedBuffer = await sharp(imageBuffer)
     .resize(800, 600)
     .jpeg({ quality: 80 })
     .toBuffer();
   ```

2. **병렬 처리**
   ```typescript
   // 여러 이미지를 동시에 처리
   const promises = testImages.map((img) => processImage(img));
   const results = await Promise.all(promises);
   ```

## 📈 결과 분석 팁

1. **임계값 선택**

   - F1 Score가 가장 높은 임계값 선택
   - 업무 요구사항에 따라 정밀도 vs 재현율 고려

2. **False Positive 분석**

   - 잘못 일치로 판단된 이미지들을 수동으로 확인
   - 유사한 얼굴 특징을 가진 다른 사람들인지 분석

3. **False Negative 분석**
   - 놓친 일치 사례들을 분석
   - 이미지 품질, 각도, 조명 등의 요인 파악

## 🔒 보안 고려사항

- 테스트에 사용되는 이미지는 개인정보보호 규정을 준수해야 합니다
- 실제 사용자 데이터 사용 시 동의를 받아야 합니다
- 테스트 결과 파일은 안전한 위치에 저장하고 적절히 삭제해야 합니다

## 📞 지원

테스트 도구 관련 문의사항이나 개선 제안이 있으시면 개발팀에 연락해주세요.
