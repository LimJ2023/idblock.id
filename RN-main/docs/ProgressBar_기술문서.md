# ProgressBar 컴포넌트 기술문서

## 개요

`ProgressBar` 컴포넌트는 다단계 비동기 작업의 진행 상황을 시각적으로 표시하는 모달 형태의 UI 컴포넌트입니다. 주로 파일 업로드, API 호출 등 시간이 소요되는 작업에서 사용자에게 현재 진행 상황을 명확히 전달하기 위해 설계되었습니다.

## 컴포넌트 구조

### 파일 구조

```
src/components/ProgressBar/
├── index.tsx          # 메인 컴포넌트
└── style.ts           # 스타일 정의
```

### 주요 구성 요소

1. **모달 오버레이**: 전체 화면을 덮는 반투명 배경
2. **진행률 바**: 전체 진행 상황을 시각적으로 표시
3. **단계별 인디케이터**: 각 단계의 상태를 번호와 색상으로 표시
4. **상태 텍스트**: 현재 진행 중인 작업에 대한 설명

## Props 인터페이스

```typescript
interface ProgressBarProps {
  isVisible: boolean; // 컴포넌트 표시 여부
  currentStep: number; // 현재 진행 중인 단계 (0부터 시작)
  totalSteps: number; // 전체 단계 수
  stepLabels: string[]; // 각 단계의 라벨 배열
  currentStepText?: string; // 현재 단계의 상세 설명 (선택사항)
}
```

### Props 상세 설명

#### `isVisible: boolean`

- 컴포넌트의 표시/숨김을 제어
- `true`: 페이드 인 애니메이션과 함께 표시
- `false`: 페이드 아웃 애니메이션과 함께 숨김

#### `currentStep: number`

- 현재 진행 중인 단계를 나타내는 0 기반 인덱스
- 예: 0 = 시작 전, 1 = 첫 번째 단계, 2 = 두 번째 단계
- 이 값에 따라 진행률 바와 단계 인디케이터의 상태가 업데이트됨

#### `totalSteps: number`

- 전체 단계의 수
- 진행률 계산에 사용: `progress = currentStep / totalSteps`

#### `stepLabels: string[]`

- 각 단계에 표시될 라벨의 배열
- 배열의 길이는 `totalSteps`와 일치해야 함
- 예: `['여권 이미지 업로드', '얼굴 이미지 업로드', '회원가입 처리', '완료']`

#### `currentStepText?: string`

- 현재 진행 중인 작업에 대한 상세 설명
- 선택사항이며, 제공되지 않으면 표시되지 않음
- 예: `'여권 이미지를 업로드하고 있습니다...'`

## 애니메이션 시스템

### 1. 페이드 애니메이션

```typescript
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (isVisible) {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
}, [isVisible]);
```

- 컴포넌트가 표시/숨김될 때 부드러운 페이드 효과 제공
- 300ms 동안 opacity가 0 ↔ 1로 변화

### 2. 진행률 바 애니메이션

```typescript
const progressAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const progress = currentStep / totalSteps;
  Animated.timing(progressAnim, {
    toValue: progress,
    duration: 500,
    useNativeDriver: false,
  }).start();
}, [currentStep, totalSteps]);
```

- `currentStep`이 변경될 때마다 진행률 바가 애니메이션과 함께 업데이트
- 500ms 동안 진행률에 따라 너비가 변화

## 시각적 상태 시스템

### 단계 인디케이터 상태

각 단계는 현재 진행 상황에 따라 3가지 상태를 가집니다:

1. **완료 상태** (`index < currentStep`)

   - 배경색: `COLOR.PRI_1_500` (주요 색상)
   - 텍스트 색상: `COLOR.WHITE`
   - 라벨 색상: `COLOR.PRI_1_500`

2. **진행 중 상태** (`index === currentStep`)

   - 배경색: `COLOR.PRI_1_300` (밝은 주요 색상)
   - 텍스트 색상: `COLOR.WHITE`
   - 라벨 색상: `COLOR.BLACK`

3. **대기 상태** (`index > currentStep`)
   - 배경색: `COLOR.DISABLED` (비활성 색상)
   - 텍스트 색상: `COLOR.PRI_3_600`
   - 라벨 색상: `COLOR.PRI_3_600`

## SignupFace에서의 구현 예시

### 1. 상태 관리

```typescript
const [progressVisible, setProgressVisible] = useState<boolean>(false);
const [currentStep, setCurrentStep] = useState<number>(0);
const [currentStepText, setCurrentStepText] = useState<string>('');

const stepLabels = ['여권 이미지 업로드', '얼굴 이미지 업로드', '회원가입 처리', '완료'];
```

### 2. 단계별 진행 제어

```typescript
const handleNext = useCallback(async () => {
  try {
    // 초기화
    setProgressVisible(true);
    setCurrentStep(0);
    setCurrentStepText('이미지를 업로드하기 전 검증을 진행하고 있습니다...');

    // 1단계: 여권 이미지 업로드
    setCurrentStep(1);
    setCurrentStepText('여권 이미지를 업로드하고 있습니다...');
    const passportResult = await apiPostAuthPassport({...});

    // 2단계: 얼굴 이미지 업로드
    setCurrentStep(2);
    setCurrentStepText('얼굴 이미지를 업로드하고 있습니다...');
    const faceResult = await apiPostAuthFace({...});

    // 3단계: 회원가입 처리
    setCurrentStep(3);
    setCurrentStepText('회원가입을 처리하고 있습니다...');
    const signupResult = await apiPostAuthSignup({...});

    // 4단계: 완료
    setCurrentStep(4);
    setCurrentStepText('회원가입이 완료되었습니다. 다음 화면으로 이동합니다...');

  } finally {
    setProgressVisible(false);
    setCurrentStep(0);
    setCurrentStepText('');
  }
}, [...]);
```

### 3. 컴포넌트 렌더링

```typescript
<ProgressBar
  isVisible={progressVisible}
  currentStep={currentStep}
  totalSteps={stepLabels.length}
  stepLabels={stepLabels}
  currentStepText={currentStepText}
/>
```

## 데이터 흐름도

```
handleNext 호출
    ↓
setProgressVisible(true) → ProgressBar 표시 시작
    ↓
setCurrentStep(0) → 초기 상태 설정
    ↓
setCurrentStepText(...) → 상태 텍스트 업데이트
    ↓
비동기 작업 1 시작
    ↓
setCurrentStep(1) → 1단계 진행 표시
    ↓
비동기 작업 1 완료
    ↓
setCurrentStep(2) → 2단계 진행 표시
    ↓
... (반복)
    ↓
모든 작업 완료
    ↓
setProgressVisible(false) → ProgressBar 숨김
```

## 스타일 구조

### 주요 스타일 클래스

- `container`: 전체 모달 오버레이
- `content`: 중앙 콘텐츠 영역
- `progressContainer`: 진행률 바 영역
- `progressBackground`: 진행률 바 배경
- `progressFill`: 진행률 바 채움 영역
- `stepsContainer`: 단계별 인디케이터 컨테이너
- `stepItem`: 개별 단계 아이템
- `stepIndicator`: 단계 번호 원형 인디케이터
- `stepLabel`: 단계 라벨 텍스트

### 반응형 디자인

```typescript
content: {
  width: '80%',
  maxWidth: 320,
  marginHorizontal: 32,
}
```

- 화면 크기에 관계없이 적절한 크기 유지
- 최대 너비 제한으로 큰 화면에서도 적절한 비율 유지

## 사용 시 주의사항

### 1. 단계 관리

- `currentStep`은 0부터 시작하여 `totalSteps`까지 진행
- `stepLabels` 배열의 길이는 반드시 `totalSteps`와 일치해야 함

### 2. 에러 처리

- 비동기 작업 중 에러 발생 시 반드시 `finally` 블록에서 상태 초기화
- 사용자에게 적절한 에러 메시지 제공

### 3. 성능 고려사항

- 애니메이션은 `useNativeDriver`를 적절히 활용하여 성능 최적화
- 진행률 바 애니메이션은 레이아웃 변경이 필요하므로 `useNativeDriver: false` 사용

## 확장 가능성

### 추가 가능한 기능

1. **취소 버튼**: 진행 중인 작업을 중단할 수 있는 기능
2. **에러 상태 표시**: 실패한 단계를 시각적으로 구분
3. **재시도 기능**: 실패한 단계부터 다시 시작
4. **커스텀 아이콘**: 각 단계별로 고유한 아이콘 표시
5. **소리/햅틱 피드백**: 단계 완료 시 사용자 피드백

이 문서를 통해 ProgressBar 컴포넌트의 전체적인 구조와 동작 원리를 이해하실 수 있을 것입니다.
