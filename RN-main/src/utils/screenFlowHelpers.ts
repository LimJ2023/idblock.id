import { ScreenFlowManager, SIGNUP_FLOW, RESET_PASSWORD_FLOW } from './screenFlow';
import { FLOW_METADATA } from './screenFlowConfig';

/**
 * 화면 플로우 관련 헬퍼 함수들
 */

// 회원가입 진행률 계산
export const getSignupProgress = (currentScreen: string): number => {
  const manager = new ScreenFlowManager(SIGNUP_FLOW, currentScreen);
  return manager.getProgress();
};

// 패스워드 리셋 진행률 계산
export const getResetPasswordProgress = (currentScreen: string): number => {
  const manager = new ScreenFlowManager(RESET_PASSWORD_FLOW, currentScreen);
  return manager.getProgress();
};

// 진행률을 퍼센트로 변환
export const getProgressPercentage = (progress: number): string => {
  return `${Math.round(progress * 100)}%`;
};

// 현재 단계와 전체 단계 정보
export const getStepInfo = (flow: string[], currentScreen: string) => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  return {
    current: manager.getCurrentIndex() + 1,
    total: manager.getFlowLength(),
    progress: manager.getProgress(),
    progressPercentage: getProgressPercentage(manager.getProgress()),
  };
};

// 회원가입 단계 정보
export const getSignupStepInfo = (currentScreen: string) => {
  return getStepInfo(SIGNUP_FLOW, currentScreen);
};

// 패스워드 리셋 단계 정보
export const getResetPasswordStepInfo = (currentScreen: string) => {
  return getStepInfo(RESET_PASSWORD_FLOW, currentScreen);
};

// 플로우 메타데이터 가져오기
export const getFlowMetadata = (flow: string[]) => {
  const flowKey = JSON.stringify(flow);
  return FLOW_METADATA[flowKey] || {
    name: 'Unknown Flow',
    description: '알 수 없는 플로우',
    estimatedTime: 'Unknown',
  };
};

// 다음 화면 미리보기 정보
export const getNextScreenInfo = (flow: string[], currentScreen: string) => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  const nextScreen = manager.getNextScreen();
  
  if (!nextScreen) {
    return null;
  }

  return {
    screenName: nextScreen,
    isLast: !manager.hasNext(),
    remainingSteps: manager.getFlowLength() - manager.getCurrentIndex() - 1,
  };
};

// 이전 화면 정보
export const getPreviousScreenInfo = (flow: string[], currentScreen: string) => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  const previousScreen = manager.getPreviousScreen();
  
  if (!previousScreen) {
    return null;
  }

  return {
    screenName: previousScreen,
    isFirst: !manager.hasPrevious(),
    completedSteps: manager.getCurrentIndex(),
  };
};

// 플로우 완료 여부 확인
export const isFlowCompleted = (flow: string[], currentScreen: string): boolean => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  return manager.getCurrentIndex() === manager.getFlowLength() - 1;
};

// 플로우 시작 여부 확인
export const isFlowStarted = (flow: string[], currentScreen: string): boolean => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  return manager.getCurrentIndex() === 0;
};

// 화면 이름을 사용자 친화적인 제목으로 변환
export const getScreenTitle = (screenName: string): string => {
  const titleMap: { [key: string]: string } = {
    SIGNUP_EMAIL: '이메일 인증',
    SIGNUP_TERM: '약관 동의',
    SIGNUP_FORM: '정보 입력',
    SIGNUP_PASSPORT: '여권 인증',
    SIGNUP_FACE: '얼굴 인증',
    SIGNUP_RESULT: '가입 완료',
    RESET_FORM_EMAIL: '이메일 입력',
    RESET_FORM_CODE: '인증번호 입력',
    RESET_FORM_PASSWORD: '새 비밀번호',
    RESET_FORM_RESULT: '재설정 완료',
  };

  return titleMap[screenName] || screenName;
};

// 진행률 바 컴포넌트에서 사용할 데이터
export const getProgressBarData = (flow: string[], currentScreen: string) => {
  const stepInfo = getStepInfo(flow, currentScreen);
  const steps = flow.map((screen, index) => ({
    title: getScreenTitle(screen.replace('MENU.STACK.SCREEN.', '')),
    isCompleted: index < stepInfo.current - 1,
    isCurrent: index === stepInfo.current - 1,
    isUpcoming: index > stepInfo.current - 1,
  }));

  return {
    steps,
    ...stepInfo,
  };
}; 