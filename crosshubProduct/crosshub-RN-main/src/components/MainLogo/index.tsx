import React, { memo } from 'react';

import { View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Text } from '~/components/Text';

import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const MainLogo = memo(function () {
  return (
    <View style={style.logoWrap}>
      <View style={style.logoTextWrap}>
        <FastImage source={STATIC_IMAGE.LOGO_TEXT} style={style.logoTextImage} resizeMode="contain" />
        <Text style={[font.BODY1_R, style.logoText1]}>All You Need Is Your Phone</Text>
        <Text style={[font.BODY1_R, style.logoText2]}>Your ID is Just a Tap Away!</Text>
      </View>
      <FastImage source={STATIC_IMAGE.SHIELD} style={style.shieldImage} resizeMode="contain" />
    </View>
  );
});
