import { useCallback, useRef } from 'react';

import { BackHandler, Platform } from 'react-native';

import { NavigationContainerRef } from '@react-navigation/native';
import RNExitApp from 'react-native-exit-app';
import Toast from 'react-native-simple-toast';

export function useHandleAndroidBack() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  const backButtonCountRef = useRef<number>(0);
  const backButtonTimerRef = useRef<NodeJS.Timeout>(null);

  const handleBackButton = useCallback(() => {
    const currentStackIndex = navigationRef.current?.getRootState()?.index;

    if (currentStackIndex > 0) {
      return false;
    }

    backButtonCountRef.current += 1;

    if (backButtonCountRef.current >= 2) {
      RNExitApp.exitApp();
    }

    if (backButtonTimerRef.current) {
      clearTimeout(backButtonTimerRef.current);
      backButtonTimerRef.current = null;
    } else {
      Toast.show('한번 더 누르면 앱이 종료됩니다', Toast.SHORT);
    }

    backButtonTimerRef.current = setTimeout(() => {
      backButtonCountRef.current = 0;
      backButtonTimerRef.current = null;
    }, 1500);

    return true;
  }, []);

  const initAndroidBackListener = useCallback((navigation: NavigationContainerRef<any>) => {
    if (Platform.OS === 'android') {
      navigationRef.current = navigation;

      BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }
  }, []);

  const clearAndroidBackListener = useCallback(() => {
    if (Platform.OS === 'android') {
      navigationRef.current = undefined;
      backButtonCountRef.current = 0;

      if (backButtonTimerRef.current) {
        clearInterval(backButtonTimerRef.current);
        backButtonTimerRef.current = null;
      }

      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    }
  }, []);

  return {
    initAndroidBackListener,
    clearAndroidBackListener,
  };
}
