import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useAccessToken } from '~/zustands/app';

import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const SignupResult = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const { accessToken } = useAccessToken();

  const { bottom } = useSafeAreaInsets();

  const handleNext = useCallback(() => {
    navigation.popToTop();
  }, []);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <View style={style.body}>
        <View style={style.bodyContent}>
          <View style={style.contentWrap}>
            <Text style={[font.SUBTITLE1, style.finishTitleText]}>{accessToken ? 'Resent Request Approval' : 'Approval Request'}</Text>
            <FastImage source={STATIC_IMAGE.SUCCESS_BLACK} style={style.finishImage} resizeMode="contain" />
            <Text style={[font.BODY1_SB, style.finishContentText]}>
              It may take several hours{'\n'}for final approval from the administrator.
            </Text>
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button style={style.nextButton} onPress={handleNext}>
            <Text style={[font.BODY3_SB, style.nextButtonText]}>{accessToken ? 'Confirm' : 'Login'}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
});
