import { Platform } from 'react-native';

export const MODAL_ANIMATION_TIMING = 200;

export const PACKAGE_NAME = 'com.crosshub.idblock';

// 개발 환경에서 사용할 수 있는 API 주소들
const DEV_API_OPTIONS = {
  // Android 에뮬레이터용 (호스트 머신 접근)
  EMULATOR: 'http://10.0.2.2:8989/api',
  // 실제 기기용 (Wi-Fi IP 사용)
  DEVICE: 'http://10.177.196.83:8989/api',
  // ADB 포트 포워딩 사용시
  LOCALHOST: 'http://localhost:8989/api',
  
};

// 운영 환경 API 주소들
// export const API_PREFIX = 'https://api.crosshub.buttersoft.dev/api';
// export const API_PREFIX = 'https://api.idblock.id/api';
// export const API_PREFIX = 'https://idblock-test.site/api';

// 개발 환경: 임시로 localhost 사용해보기 (회원가입 API 네트워크 에러 해결 시도)
export const API_PREFIX = DEV_API_OPTIONS.DEVICE;

export const DEFAULT_POSITION = {
  LAT: 0,
  LONG: 0,
};

export const KEY_STORAGE = {
  ACCESS_TOKEN: 'KEY_ACCESS_TOKEN',
  REFRESH_TOKEN: 'KEY_REFRESH_TOKEN',
  AUTH_EMAIL: 'KEY_AUTH_EMAIL',
};

export const MENU = {
  STACK: {
    CONTAINER: 'STACK_CONTAINER',
    SCREEN: {
      SIGNIN: 'SIGNIN',
      SIGNUP_EMAIL: 'SIGNUP_EMAIL',
      SIGNUP_TERM: 'SIGNUP_TERM',
      SIGNUP_FORM: 'SIGNUP_FORM',
      SIGNUP_PASSPORT: 'SIGNUP_PASSPORT',
      SIGNUP_FACE: 'SIGNUP_FACE',
      SIGNUP_RESULT: 'SIGNUP_RESULT',
      SIGNUP_SIMPLE_RESULT: 'SIGNUP_SIMPLE_RESULT',
      MAIN: 'MAIN',
      ALARM: 'ALARM',
      ID_CARD_PENDING: 'ID_CARD_PENDING',
      ID_CARD_DENIED: 'ID_CARD_DENIED',
      ID_CARD: 'ID_CARD',
      QR: 'QR',
      HISTORY: 'HISTORY',
      RESET_FORM_EMAIL: 'RESET_FORM_EMAIL',
      RESET_FORM_CODE: 'RESET_FORM_CODE',
      RESET_FORM_PASSWORD: 'RESET_FORM_PASSWORD',
      RESET_FORM_RESULT: 'RESET_FORM_RESULT',
    },
  },
};

export const STATIC_LOTTIE = {};

export const STATIC_IMAGE = {
  ALARM: require('~/assets/images/alarm.png'),
  ARROW_DOWN_BLACK: require('~/assets/images/arrow.down.black.png'),
  ARROW_LEFT_BLACK: require('~/assets/images/arrow.left.black.png'),
  ARROW_RIGHT_GRAY: require('~/assets/images/arrow.right.gray.png'),
  CAMERA_WHITE: require('~/assets/images/camera.white.png'),
  CHECK_CIRCLE_GREEN_FILL: require('~/assets/images/check.circle.green.fill.png'),
  CHECK_CIRCLE_GREEN: require('~/assets/images/check.circle.green.png'),
  CHECK_CIRCLE_PRI: require('~/assets/images/check.circle.pri.png'),
  CHECK_GRAY: require('~/assets/images/check.gray.png'),
  CHECK_GREEN: require('~/assets/images/check.green.png'),
  CHECK_PRI: require('~/assets/images/check.pri.png'),
  CLOSE_BLACK: require('~/assets/images/close.black.png'),
  CLOSE_WHITE: require('~/assets/images/close.white.png'),
  EMPTY_DATA: require('~/assets/images/empty.data.png'),
  FACE_SYMBOL: require('~/assets/images/face.symbol.png'),
  IDCARD_BG: require('~/assets/images/idcard.bg.png'),
  IDCARD_PENDING: require('~/assets/images/idcard.pending.png'),
  LOGO_IMAGE: require('~/assets/images/logo.image.png'),
  LOGO_TEXT: require('~/assets/images/logo.text.png'),
  MAIN_BUTTON_1: require('~/assets/images/main.button.1.png'),
  MAIN_BUTTON_2: require('~/assets/images/main.button.2.png'),
  MAIN_BUTTON_3: require('~/assets/images/main.button.3.png'),
  MAIN_BUTTON_2_DISABLE: require('~/assets/images/main.button.2.disable.png'),
  MAIN_BUTTON_3_DISABLE: require('~/assets/images/main.button.3.disable.png'),
  MENU: require('~/assets/images/menu.png'),
  PASSPORT_SAMPLE: require('~/assets/images/passport.sample.png'),
  PLUS_GREEN: require('~/assets/images/plus.green.png'),
  PLUS_WHITE: require('~/assets/images/plus.white.png'),
  REFRESH_BLACK: require('~/assets/images/refresh.black.png'),
  SHIELD: require('~/assets/images/shield.png'),
  SHIELD_NO_SHADOW: require('~/assets/images/shield.no.shadow.png'),
  SUCCESS_BLACK: require('~/assets/images/success.black.png'),
  SUCCESS_GREEN: require('~/assets/images/success.green.png'),
};
