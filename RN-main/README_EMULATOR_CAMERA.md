# 안드로이드 에뮬레이터에서 카메라 테스트하기

## 1. 개발 환경 테스트 기능 사용하기

현재 앱에는 개발 환경(`__DEV__`)에서만 표시되는 테스트 기능이 추가되어 있습니다:

### 사용 가능한 개발 기능:

- **Set Mock Image (Dev)**: 미리 정의된 테스트 이미지를 바로 설정
- **Choose from Gallery (Dev)**: 갤러리에서 이미지 선택

이 버튼들은 프로덕션 빌드에서는 표시되지 않습니다.

## 2. 에뮬레이터 카메라 설정하기

### AVD Manager에서 카메라 설정:

1. Android Studio > AVD Manager 열기
2. 에뮬레이터 편집 (연필 아이콘)
3. "Show Advanced Settings" 클릭
4. Camera 설정:
   - **Front Camera**: Webcam0 또는 Emulated
   - **Back Camera**: Webcam0 또는 Emulated

### 에뮬레이터 실행 시 카메라 옵션:

```bash
# 웹캠을 사용하여 에뮬레이터 실행
emulator -avd YOUR_AVD_NAME -camera-back webcam0 -camera-front webcam0

# 또는 가상 카메라 사용
emulator -avd YOUR_AVD_NAME -camera-back emulated -camera-front emulated
```

## 3. 실제 기기에서 테스트하기

가장 확실한 방법은 실제 안드로이드 기기를 사용하는 것입니다:

1. USB 디버깅 활성화
2. 기기 연결
3. `npx react-native run-android` 실행

## 4. 개발 팁

### Mock 이미지 URL 변경:

`src/screens/SignupFace/index.tsx`에서 `mockImageUrl`을 원하는 이미지로 변경할 수 있습니다.

```javascript
const mockImageUrl = 'YOUR_TEST_IMAGE_URL';
```

### 갤러리 테스트:

에뮬레이터에 테스트 이미지를 추가하려면:

1. 에뮬레이터 실행
2. 브라우저에서 이미지 다운로드
3. 갤러리 앱에서 확인

## 5. 문제 해결

### 카메라 권한 문제:

- 에뮬레이터 설정 > 앱 > CrossHub > 권한 > 카메라 허용

### 갤러리 권한 문제:

- 에뮬레이터 설정 > 앱 > CrossHub > 권한 > 저장소 허용

### 이미지가 표시되지 않는 경우:

- 네트워크 연결 확인 (Mock 이미지 사용 시)
- 이미지 URL 유효성 확인
- 콘솔 로그 확인
