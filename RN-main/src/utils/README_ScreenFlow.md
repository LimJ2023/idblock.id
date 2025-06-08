# 화면 플로우 관리 시스템

이 시스템을 사용하면 앱의 화면 순서를 쉽게 변경하고 관리할 수 있습니다.

## 📁 파일 구조

- `screenFlow.ts` - 핵심 플로우 관리 클래스와 기본 함수들
- `screenFlowConfig.ts` - 플로우 설정 및 순서 정의
- `screenFlowHelpers.ts` - 진행률, 단계 정보 등 헬퍼 함수들

## 🚀 기본 사용법

### 1. 화면 순서 변경하기

`screenFlowConfig.ts` 파일에서 `CURRENT_SIGNUP_FLOW`를 변경하면 됩니다:

```typescript
// 기본 플로우
export const CURRENT_SIGNUP_FLOW = DEFAULT_SIGNUP_FLOW;

// 여권 인증을 먼저 하는 플로우로 변경
export const CURRENT_SIGNUP_FLOW = PASSPORT_FIRST_SIGNUP_FLOW;

// 간소화된 플로우로 변경
export const CURRENT_SIGNUP_FLOW = SIMPLIFIED_SIGNUP_FLOW;
```

### 2. 화면에서 다음 화면으로 이동

각 화면의 `handleNext` 메소드에서:

```typescript
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

const handleNext = useCallback(() => {
  const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_PASSPORT);

  if (nextScreen) {
    navigation.push(nextScreen, { ...params });
  } else {
    // 플로우 마지막 처리
    console.warn('No next screen found in signup flow');
  }
}, []);
```

### 3. 진행률 표시

```typescript
import { getSignupStepInfo } from '~/utils/screenFlowHelpers';

const stepInfo = getSignupStepInfo(MENU.STACK.SCREEN.SIGNUP_PASSPORT);
console.log(`${stepInfo.current}/${stepInfo.total} (${stepInfo.progressPercentage})`);
// 출력: "4/6 (67%)"
```

## 🔧 고급 사용법

### 1. 새로운 플로우 만들기

```typescript
// screenFlowConfig.ts에 추가
export const MY_CUSTOM_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_EMAIL,
  MENU.STACK.SCREEN.SIGNUP_FORM,
  MENU.STACK.SCREEN.SIGNUP_FACE, // 여권 인증 생략
  MENU.STACK.SCREEN.SIGNUP_RESULT,
];
```

### 2. 조건부 플로우

```typescript
// 사용자 타입에 따라 다른 플로우 사용
import { getSignupFlowByUserType } from '~/utils/screenFlowConfig';

const userType = 'premium'; // 'default' | 'premium' | 'simplified'
const flow = getSignupFlowByUserType(userType);
const nextScreen = getNextScreenInFlow(flow, currentScreen);
```

### 3. A/B 테스트

```typescript
import { getSignupFlowForABTest } from '~/utils/screenFlowConfig';

const testGroup = Math.random() > 0.5 ? 'A' : 'B';
const flow = getSignupFlowForABTest(testGroup);
```

### 4. 플로우 동적 수정

```typescript
import { ScreenFlowManager } from '~/utils/screenFlow';

const manager = new ScreenFlowManager(SIGNUP_FLOW, currentScreen);

// 화면 추가
manager.insertScreen(MENU.STACK.SCREEN.SIGNUP_ADDITIONAL, 3);

// 화면 제거
manager.removeScreen(MENU.STACK.SCREEN.SIGNUP_TERM);

// 순서 변경
const newFlow = [
  /* 새로운 순서 */
];
manager.reorderFlow(newFlow);
```

## 📊 진행률 및 단계 정보

### 기본 정보

```typescript
import { getSignupStepInfo, getProgressBarData } from '~/utils/screenFlowHelpers';

// 현재 단계 정보
const stepInfo = getSignupStepInfo(currentScreen);
console.log(stepInfo);
// {
//   current: 4,
//   total: 6,
//   progress: 0.67,
//   progressPercentage: "67%"
// }

// 진행률 바 데이터
const progressData = getProgressBarData(SIGNUP_FLOW, currentScreen);
console.log(progressData.steps);
// [
//   { title: "이메일 인증", isCompleted: true, isCurrent: false, isUpcoming: false },
//   { title: "약관 동의", isCompleted: true, isCurrent: false, isUpcoming: false },
//   { title: "정보 입력", isCompleted: true, isCurrent: false, isUpcoming: false },
//   { title: "여권 인증", isCompleted: false, isCurrent: true, isUpcoming: false },
//   { title: "얼굴 인증", isCompleted: false, isCurrent: false, isUpcoming: true },
//   { title: "가입 완료", isCompleted: false, isCurrent: false, isUpcoming: true }
// ]
```

### 다음/이전 화면 정보

```typescript
import { getNextScreenInfo, getPreviousScreenInfo } from '~/utils/screenFlowHelpers';

// 다음 화면 정보
const nextInfo = getNextScreenInfo(SIGNUP_FLOW, currentScreen);
if (nextInfo) {
  console.log(`다음: ${nextInfo.screenName}, 남은 단계: ${nextInfo.remainingSteps}`);
}

// 이전 화면 정보
const prevInfo = getPreviousScreenInfo(SIGNUP_FLOW, currentScreen);
if (prevInfo) {
  console.log(`이전: ${prevInfo.screenName}, 완료된 단계: ${prevInfo.completedSteps}`);
}
```

## 🎯 실제 적용 예시

### SignupPassport 화면 개선 전/후

**개선 전:**

```typescript
const handleNext = useCallback(() => {
  navigation.push(MENU.STACK.SCREEN.SIGNUP_FACE, { ...params });
}, []);
```

**개선 후:**

```typescript
const handleNext = useCallback(() => {
  const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_PASSPORT);

  if (nextScreen) {
    navigation.push(nextScreen, { ...params });
  } else {
    console.warn('No next screen found in signup flow');
  }
}, []);
```

### 진행률 표시 컴포넌트

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { getSignupStepInfo } from '~/utils/screenFlowHelpers';

const ProgressIndicator = ({ currentScreen }) => {
  const stepInfo = getSignupStepInfo(currentScreen);

  return (
    <View>
      <Text>
        {stepInfo.current}/{stepInfo.total}
      </Text>
      <View style={{ width: '100%', height: 4, backgroundColor: '#eee' }}>
        <View
          style={{
            width: stepInfo.progressPercentage,
            height: '100%',
            backgroundColor: '#007AFF',
          }}
        />
      </View>
    </View>
  );
};
```

## 🔄 플로우 변경 시나리오

### 시나리오 1: 여권 인증을 먼저 하고 싶은 경우

```typescript
// screenFlowConfig.ts
export const CURRENT_SIGNUP_FLOW = PASSPORT_FIRST_SIGNUP_FLOW;
```

### 시나리오 2: 약관 동의를 생략하고 싶은 경우

```typescript
// screenFlowConfig.ts
export const CURRENT_SIGNUP_FLOW = SIMPLIFIED_SIGNUP_FLOW;
```

### 시나리오 3: 완전히 새로운 순서

```typescript
// screenFlowConfig.ts
export const CUSTOM_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_EMAIL,
  MENU.STACK.SCREEN.SIGNUP_FACE, // 얼굴 인증을 먼저
  MENU.STACK.SCREEN.SIGNUP_PASSPORT, // 여권 인증을 나중에
  MENU.STACK.SCREEN.SIGNUP_FORM, // 정보 입력을 마지막에
  MENU.STACK.SCREEN.SIGNUP_RESULT,
];

export const CURRENT_SIGNUP_FLOW = CUSTOM_FLOW;
```

## ⚠️ 주의사항

1. **파라미터 전달**: 화면 순서를 바꿀 때 각 화면에서 필요한 파라미터가 제대로 전달되는지 확인하세요.

2. **의존성 확인**: 일부 화면은 이전 화면의 데이터에 의존할 수 있습니다. 순서를 바꿀 때 이를 고려하세요.

3. **테스트**: 플로우를 변경한 후에는 전체 플로우를 테스트해보세요.

4. **백업**: 기존 플로우를 백업해두고 새로운 플로우를 테스트하세요.

## 🚀 향후 개선 사항

- [ ] 플로우 검증 함수 추가
- [ ] 플로우 시각화 도구
- [ ] 동적 플로우 로딩
- [ ] 플로우 분석 및 통계
- [ ] 플로우 A/B 테스트 자동화
