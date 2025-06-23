import { MENU } from './constant';

/**
 * 화면 플로우 설정 관리
 * 이 파일에서 화면 순서를 간편하게 변경할 수 있습니다.
 */

// 기본 회원가입 플로우
export const DEFAULT_SIGNUP_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_EMAIL,
  MENU.STACK.SCREEN.SIGNUP_TERM,
  MENU.STACK.SCREEN.SIGNUP_FORM,
  MENU.STACK.SCREEN.SIGNUP_PASSPORT,
  MENU.STACK.SCREEN.SIGNUP_FACE,
  MENU.STACK.SCREEN.SIGNUP_RESULT,
];

// 대체 회원가입 플로우 예시 (여권 인증을 먼저)
export const PASSPORT_FIRST_SIGNUP_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_EMAIL,
  MENU.STACK.SCREEN.SIGNUP_TERM,
  MENU.STACK.SCREEN.SIGNUP_PASSPORT,
  MENU.STACK.SCREEN.SIGNUP_FORM,
  MENU.STACK.SCREEN.SIGNUP_FACE,
  MENU.STACK.SCREEN.SIGNUP_RESULT,
];

// 간소화된 회원가입 플로우 (약관 생략)
export const SIMPLIFIED_SIGNUP_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_EMAIL,
  MENU.STACK.SCREEN.SIGNUP_SIMPLE_RESULT,
  MENU.STACK.SCREEN.SIGNUP_PASSPORT,
  MENU.STACK.SCREEN.SIGNUP_FORM,
  MENU.STACK.SCREEN.SIGNUP_FACE,
  MENU.STACK.SCREEN.SIGNUP_RESULT,
];

// 기본 패스워드 리셋 플로우
export const DEFAULT_RESET_PASSWORD_FLOW = [
  MENU.STACK.SCREEN.RESET_FORM_EMAIL,
  MENU.STACK.SCREEN.RESET_FORM_CODE,
  MENU.STACK.SCREEN.RESET_FORM_PASSWORD,
  MENU.STACK.SCREEN.RESET_FORM_RESULT,
];

// 간편가입 후 나중에 여권인증 플로우
export const AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW = [
  MENU.STACK.SCREEN.SIGNUP_TERM,
  MENU.STACK.SCREEN.SIGNUP_PASSPORT,
  MENU.STACK.SCREEN.SIGNUP_FORM,
  MENU.STACK.SCREEN.SIGNUP_FACE,
  MENU.STACK.SCREEN.SIGNUP_RESULT,
]

// 현재 사용할 플로우 설정
// 여기서 플로우를 쉽게 변경할 수 있습니다!
export const CURRENT_SIGNUP_FLOW = SIMPLIFIED_SIGNUP_FLOW; // 다른 플로우로 변경하려면 이 부분을 수정
export const CURRENT_RESET_PASSWORD_FLOW = DEFAULT_RESET_PASSWORD_FLOW;
export const CURRENT_AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW = AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW;
/**
 * 플로우 변경 가이드:
 * 
 * 1. 화면 순서 변경:
 *    CURRENT_SIGNUP_FLOW를 다른 플로우로 변경하거나 직접 배열을 수정
 * 
 * 2. 새로운 플로우 추가:
 *    export const MY_CUSTOM_FLOW = [...] 형태로 새로운 플로우 정의
 * 
 * 3. 조건부 플로우:
 *    함수를 사용해서 사용자 조건에 따라 다른 플로우 반환
 * 
 * 예시:
 * export const getSignupFlow = (userType: string) => {
 *   switch(userType) {
 *     case 'premium': return PASSPORT_FIRST_SIGNUP_FLOW;
 *     case 'basic': return SIMPLIFIED_SIGNUP_FLOW;
 *     default: return DEFAULT_SIGNUP_FLOW;
 *   }
 * };
 */

// 조건부 플로우 함수 예시
export const getSignupFlowByUserType = (userType: 'default' | 'premium' | 'simplified' = 'default') => {
  switch (userType) {
    case 'premium':
      return PASSPORT_FIRST_SIGNUP_FLOW;
    case 'simplified':
      return SIMPLIFIED_SIGNUP_FLOW;
    default:
      return DEFAULT_SIGNUP_FLOW;
  }
};

// A/B 테스트를 위한 플로우 선택 함수
export const getSignupFlowForABTest = (testGroup: 'A' | 'B' = 'A') => {
  return testGroup === 'A' ? DEFAULT_SIGNUP_FLOW : PASSPORT_FIRST_SIGNUP_FLOW;
};

// 플로우 메타데이터
export const FLOW_METADATA = {
  [JSON.stringify(DEFAULT_SIGNUP_FLOW)]: {
    name: 'Default Signup Flow',
    description: 'Default registration flow',
    estimatedTime: '5-10 minutes',
  },
  [JSON.stringify(PASSPORT_FIRST_SIGNUP_FLOW)]: {
    name: 'Passport First Flow',
    description: 'Flow that starts with passport verification',
    estimatedTime: '5-10 minutes',
  },
  [JSON.stringify(SIMPLIFIED_SIGNUP_FLOW)]: {
    name: 'Simplified Flow',
    description: 'Simplified registration flow',
    estimatedTime: '3-5 minutes',
  },
  [JSON.stringify(AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW)]: {
    name: 'After Simple Signup Verification Flow',
    description: 'Passport verification flow after simple registration',
    estimatedTime: '3-5 minutes',
  },
}; 