import React, { memo, useCallback } from 'react';

import { ScrollView, View } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Shadow } from 'react-native-shadow-2';
import FastImage from 'react-native-fast-image';

import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useAppRootAction } from '~/zustands/app';
import { useProfile } from '~/zustands/user';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const IdCardDenied = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const { setSafeAreaColor } = useAppRootAction();
  const { profile } = useProfile();

  const handleForm = useCallback(() => {
    navigation.push(MENU.STACK.SCREEN.SIGNUP_FORM, {});
  }, []);

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
      <Header title="Identification Denied" />
      <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={style.body}>
          <View style={style.bodyContent}>
            <View style={style.idcardPendingCard}>
              <Shadow startColor="#E5E2E199" endColor="#EDE9E850" distance={3}>
                <View style={style.profileWrap}>
                  <Text style={[font.T3_B, style.profileTitleText]}>Mobile{'\n'}Identification</Text>
                  <Text style={[font.CAPTION1_R, style.profileTitleCaptionText]}>Mobile Identification</Text>
                  {profile.profileImage && (
                    <FastImage source={{ uri: profile.profileImage }} style={style.faceImage} resizeMode="contain" />
                  )}
                  <Text style={[font.T2, style.nameText]}>{profile.name}</Text>
                  <View style={style.honoraryWrap}>
                    <Text style={[font.CAPTION2, style.honoraryText]}>HONORARY CITIZEN OF {profile.city.name}</Text>
                  </View>
                </View>
              </Shadow>
            </View>
            <Text style={[font.SUBTITLE2_SB, style.deniedGuideText]}>Your request has been denied.</Text>
            {profile.reason && (
              <View style={style.deniedReasonWrap}>
                <Text style={[font.BODY1_B, style.deniedReasonTitle]}>Reason for Denial</Text>
                <View style={style.guideContentTextWrap}>
                  <Text style={[font.SUBTITLE2_B, style.guideContentHead]}>·</Text>
                  <Text style={[font.BODY1_R, style.guideContentText]}>{profile.reason}</Text>
                </View>
              </View>
            )}
          </View>
          <View style={style.bottomButtonWrap}>
            <Button style={style.bottomButton} onPress={handleForm}>
              <Text style={[font.BODY3_SB, style.bottomButtonText]}>Edit Input Information</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
