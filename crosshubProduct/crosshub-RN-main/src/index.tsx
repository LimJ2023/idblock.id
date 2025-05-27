import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LayoutChangeEvent, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation-locker';

import { Navigation } from '~/navigations';

import { Dimension, useAppRootAction, useDimension } from '~/zustands/app';

import { useInitTokenFromStorage } from '~/hooks/init.token.from.storage';

import { globalStyle } from '~/style';
import { COLOR } from '~/utils/guide';
import Util from '~/utils/common';
import { UpdateAlert } from './components/UpdateAlert';

export function Application() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const { setDimension } = useAppRootAction();
  const { dimension } = useDimension();

  const { initTokenFromStorage } = useInitTokenFromStorage();

  const dimensionRef = useRef<Dimension>();

  if (dimensionRef.current?.width !== dimension?.width) {
    dimensionRef.current = dimension;
  }

  const handleLayout = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    if (nativeEvent.layout.width !== dimensionRef.current?.width) {
      setDimension({
        width: nativeEvent.layout.width,
        height: nativeEvent.layout.height,
      });
    }
  }, []);

  useEffect(() => {
    Orientation.lockToPortrait();

    initTokenFromStorage().then(() => {
      Util.sleep(200).then(() => {
        setIsLoaded(true);
      });
    });
  }, []);

  useEffect(() => {}, []);

  return (
    <GestureHandlerRootView style={globalStyle.flex} onLayout={handleLayout}>
      <StatusBar backgroundColor={COLOR.WHITE} barStyle="dark-content" />
      {isLoaded && (
        <SafeAreaProvider>
          <Navigation />
        </SafeAreaProvider>
      )}
      <UpdateAlert />
    </GestureHandlerRootView>
  );
}
