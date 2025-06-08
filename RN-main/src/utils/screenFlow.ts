import { MENU } from './constant';
import { CURRENT_SIGNUP_FLOW, CURRENT_RESET_PASSWORD_FLOW } from './screenFlowConfig';

// 현재 설정된 플로우를 사용
export const SIGNUP_FLOW = CURRENT_SIGNUP_FLOW;
export const RESET_PASSWORD_FLOW = CURRENT_RESET_PASSWORD_FLOW;

// 화면 플로우 관리 클래스
export class ScreenFlowManager {
  private flow: string[];
  private currentIndex: number;

  constructor(flow: string[], currentScreen?: string) {
    this.flow = flow;
    this.currentIndex = currentScreen ? flow.indexOf(currentScreen) : 0;
  }

  // 현재 화면 인덱스 반환
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  // 현재 화면명 반환
  getCurrentScreen(): string {
    return this.flow[this.currentIndex];
  }

  // 다음 화면명 반환
  getNextScreen(): string | null {
    const nextIndex = this.currentIndex + 1;
    return nextIndex < this.flow.length ? this.flow[nextIndex] : null;
  }

  // 이전 화면명 반환
  getPreviousScreen(): string | null {
    const prevIndex = this.currentIndex - 1;
    return prevIndex >= 0 ? this.flow[prevIndex] : null;
  }

  // 특정 화면으로 인덱스 이동
  setCurrentScreen(screenName: string): boolean {
    const index = this.flow.indexOf(screenName);
    if (index !== -1) {
      this.currentIndex = index;
      return true;
    }
    return false;
  }

  // 다음 화면으로 이동 가능한지 확인
  hasNext(): boolean {
    return this.currentIndex + 1 < this.flow.length;
  }

  // 이전 화면으로 이동 가능한지 확인
  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  // 전체 플로우 길이 반환
  getFlowLength(): number {
    return this.flow.length;
  }

  // 진행률 반환 (0~1)
  getProgress(): number {
    return (this.currentIndex + 1) / this.flow.length;
  }

  // 플로우에서 특정 화면의 인덱스 반환
  getScreenIndex(screenName: string): number {
    return this.flow.indexOf(screenName);
  }

  // 플로우 순서 변경
  reorderFlow(newFlow: string[]): void {
    // 현재 화면 기준으로 새로운 인덱스 찾기
    const currentScreen = this.getCurrentScreen();
    this.flow = newFlow;
    this.currentIndex = Math.max(0, newFlow.indexOf(currentScreen));
  }

  // 플로우에 화면 삽입
  insertScreen(screenName: string, index: number): void {
    this.flow.splice(index, 0, screenName);
    if (index <= this.currentIndex) {
      this.currentIndex++;
    }
  }

  // 플로우에서 화면 제거
  removeScreen(screenName: string): boolean {
    const index = this.flow.indexOf(screenName);
    if (index !== -1) {
      this.flow.splice(index, 1);
      if (index < this.currentIndex) {
        this.currentIndex--;
      } else if (index === this.currentIndex && this.currentIndex >= this.flow.length) {
        this.currentIndex = Math.max(0, this.flow.length - 1);
      }
      return true;
    }
    return false;
  }
}

// 전역 플로우 매니저 팩토리
export const createSignupFlowManager = (currentScreen?: string) => {
  return new ScreenFlowManager(SIGNUP_FLOW, currentScreen);
};

export const createResetPasswordFlowManager = (currentScreen?: string) => {
  return new ScreenFlowManager(RESET_PASSWORD_FLOW, currentScreen);
};

// 화면 순서를 유연하게 관리하기 위한 헬퍼 함수들
export const getNextScreenInFlow = (flow: string[], currentScreen: string): string | null => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  return manager.getNextScreen();
};

export const getPreviousScreenInFlow = (flow: string[], currentScreen: string): string | null => {
  const manager = new ScreenFlowManager(flow, currentScreen);
  return manager.getPreviousScreen();
}; 