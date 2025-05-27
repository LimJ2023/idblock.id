import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { View } from 'react-native';

import { Shadow } from 'react-native-shadow-2';
import FastImage from '@d11/react-native-fast-image';

import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useApiGetQr } from '~/hooks/api.get.qr';

import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const Qr = memo(function () {
  const [image, setImage] = useState<string>('');
  const [sec, setSec] = useState<number>(0);

  const { apiGetQr } = useApiGetQr();

  const timerRef = useRef<NodeJS.Timeout>();

  const secRef = useRef<number>();

  if (secRef.current !== sec) {
    secRef.current = sec;
  }

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const refreshQr = useCallback(async () => {
    clearTimer();

    const imageBase64 = await apiGetQr();

    setImage(imageBase64);
    setSec(60);

    timerRef.current = setInterval(() => {
      if (secRef.current > 0) {
        setSec((_sec) => _sec - 1);
      } else {
        refreshQr();
      }
    }, 1000);
  }, []);

  useEffect(() => {
    refreshQr();

    return () => {
      clearTimer();
    };
  }, []);

  return (
    <View style={style.container}>
      <Header
        title="QR Code"
        rightChild={
          <Button style={style.refreshButton} duration={1000} onPress={refreshQr}>
            <FastImage source={STATIC_IMAGE.REFRESH_BLACK} style={style.refreshButtonImage} resizeMode="contain" />
          </Button>
        }
      />
      <View style={style.body}>
        <View style={style.bodyContent}>
          <Shadow startColor="#AAAAAA20" distance={15}>
            <View style={style.qrWrap}>{image && <FastImage source={{ uri: image }} style={style.qrImage} resizeMode="contain" />}</View>
          </Shadow>
          <View style={style.secondsTextWrap}>
            <Text style={[font.CAPTION1_R, style.secondsText]}>
              Remaining <Text style={style.secondsTextHighlight}>{sec} Seconds</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});
