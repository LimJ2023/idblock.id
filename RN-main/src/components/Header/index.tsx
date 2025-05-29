import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const Header = memo(function ({ title, leftChild, centerChild, rightChild }: Props) {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, []);

  return (
    <View style={style.container}>
      <View style={style.headerLeftWrap}>
        {leftChild || (
          <Button style={style.headerBackButton} onPress={handleBack}>
            <FastImage source={STATIC_IMAGE.ARROW_LEFT_BLACK} style={style.headerBackButtonImage} resizeMode="contain" />
          </Button>
        )}
      </View>
      <View style={style.headerCenterWrap}>{centerChild || <Text style={[font.SUBTITLE3_M, style.headerTitleText]}>{title}</Text>}</View>
      <View style={style.hedaerRightWrap}>{rightChild}</View>
    </View>
  );
});

interface Props {
  title?: string;
  leftChild?: JSX.Element;
  centerChild?: JSX.Element;
  rightChild?: JSX.Element;
}
