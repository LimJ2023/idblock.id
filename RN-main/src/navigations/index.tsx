import React, { memo, useCallback, useEffect, useRef } from 'react';

import { View } from 'react-native';

import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

import { ModalSpinner } from '~/components/ModalSpinner';
import { StackNavigator } from './Stack';

import { useIsVisibleLoading, useSafeAreaColor } from '~/zustands/app';

import { useHandleAndroidBack } from '~/hooks/handle.android.back';

import { globalStyle } from '~/style';

export const Navigation = memo(function () {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  const { safeAreaColor } = useSafeAreaColor();
  const { isVisibleLoading } = useIsVisibleLoading();

  const { initAndroidBackListener, clearAndroidBackListener } = useHandleAndroidBack();
  const { top } = useSafeAreaInsets();

  const handleNavigationReady = useCallback(() => {}, []);

  useEffect(() => {
    initAndroidBackListener(navigationRef.current);

    return () => {
      clearAndroidBackListener();

      FastImage.clearDiskCache();
      FastImage.clearMemoryCache();
    };
  }, []);

  return (
    <View style={[globalStyle.safeAreaView, { backgroundColor: safeAreaColor, paddingTop: top }]}>
      <ModalSpinner isVisible={isVisibleLoading} />
      <NavigationContainer ref={navigationRef} onReady={handleNavigationReady}>
        <StackNavigator />
      </NavigationContainer>
    </View>
  );
});
