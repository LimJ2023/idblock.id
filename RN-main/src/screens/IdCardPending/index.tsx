import React, { memo, useCallback } from 'react';

import { ScrollView, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import FastImage from '@d11/react-native-fast-image';

import { Header } from '~/components/Header';
import { Text } from '~/components/Text';

import { useAppRootAction } from '~/zustands/app';
import { useProfile } from '~/zustands/user';

import { STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const IdCardPending = memo(function () {
  const { setSafeAreaColor } = useAppRootAction();
  const { profile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      setSafeAreaColor('#FAEFE7');

      return () => {
        setSafeAreaColor(COLOR.WHITE);
      };
    }, []),
  );

  return (
    <View style={style.container}>
      <FastImage source={STATIC_IMAGE.IDCARD_BG} style={style.containerImageBg} resizeMode="contain" />
      <Header title="Identification Pending" />
      <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={style.body}>
          <View style={style.bodyContent}>
            <View style={style.idcardPendingCard}>
              <FastImage source={STATIC_IMAGE.IDCARD_PENDING} style={style.idcardPendingImage} resizeMode="contain" />
              <Shadow
                startColor="#E5E2E160"
                endColor="#EDE9E820"
                distance={6}
                style={{ zIndex: -1, width: '100%' }}
                containerStyle={{ zIndex: -1, marginTop: -30 }}>
                <View style={style.profileWrap}>
                  <View style={style.honoraryWrap}>
                    <Text style={[font.CAPTION2, style.honoraryText]}>HONORARY CITIZEN OF {profile.city.name}</Text>
                  </View>
                  <Text style={[font.T2, style.nameText]}>{profile.name}</Text>
                </View>
              </Shadow>
            </View>
            <Text style={[font.BODY1_R, style.pendingGuideText]}>You cannot use QR authentication before administrator approval</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
