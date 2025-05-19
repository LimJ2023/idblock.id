import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const ResetFormResult = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const { bottom } = useSafeAreaInsets();

  const handleNext = useCallback(() => {
    navigation.popToTop();
  }, []);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <View style={style.body}>
        <View style={style.bodyContent}>
          <View style={style.contentWrap}>
            <FastImage source={STATIC_IMAGE.SUCCESS_GREEN} style={style.finishImage} resizeMode="contain" />
            <Text style={[font.SUBTITLE3_B, style.finishTitleText]}>Password Reset Successful</Text>
            <Text style={[font.BODY1_R, style.finishContentText]}>Your password has been{'\n'}reset successfully.</Text>
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button style={style.nextButton} onPress={handleNext}>
            <Text style={[font.BODY3_SB, style.nextButtonText]}>Confirm</Text>
          </Button>
        </View>
      </View>
    </View>
  );
});
