import React, { memo, useCallback, useRef, useState } from 'react';

import { View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from '@d11/react-native-fast-image';

import { Input, InputMessage } from '~/components/Input';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useApiPostResetVerify } from '~/hooks/api.post.reset.verify';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';

export const ResetFormEmail = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isCorrectFormat, setIsCorrectFormat] = useState<boolean>(false);
  const [mail, setMail] = useState<string>('');
  const [mailMessage, setMailMessage] = useState<InputMessage>();

  const { apiPostResetVerify } = useApiPostResetVerify();
  const { bottom } = useSafeAreaInsets();

  const mailRef = useRef<string>();

  if (mailRef.current !== mail) {
    mailRef.current = mail;
  }

  const handleMail = useCallback((text: string) => {
    const value = text.trim();

    if (value) {
      setIsCorrectFormat(Util.regexEmail(value));
    }

    setMailMessage(undefined);
    setMail(value);
  }, []);

  const handleNext = useCallback(async () => {
    const response = await apiPostResetVerify({
      email: mailRef.current,
    });

    if (response.uuid) {
      navigation.push(MENU.STACK.SCREEN.RESET_FORM_CODE, {
        uuid: response.uuid,
        mail: mailRef.current,
      });
    } else {
      setMailMessage({
        text: 'The email address does not exist',
        color: COLOR.ERROR,
      });
    }
  }, []);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <Header />
      <KeyboardAwareScrollView
        contentContainerStyle={style.body}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={110}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
        enableOnAndroid={true}>
        <View style={style.bodyContent}>
          <FastImage source={STATIC_IMAGE.SHIELD_NO_SHADOW} style={style.logoImage} resizeMode="contain" />
          <View style={style.formWrap}>
            <Text style={[font.SUBTITLE3_B, style.titleText]}>Forgot Password</Text>
            <Text style={[font.BODY2_R, style.contentText]}>Please enter your email address{'\n'}to reset your password.</Text>
            <Input
              keyboardType="email-address"
              placeholder="Enter your email address..."
              wrapperStyle={style.formInputWrapper}
              containerStyle={[style.formInputContainer, { borderColor: mailMessage ? COLOR.ERROR : '#F5F5F6' }]}
              value={mail}
              message={mailMessage}
              onChangeText={handleMail}
            />
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button
            style={[style.nextButton, { backgroundColor: isCorrectFormat ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!isCorrectFormat}
            onPress={handleNext}>
            <Text style={[font.BODY3_B, { color: isCorrectFormat ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Continue</Text>
          </Button>
          <Text style={[font.CAPTION1_M, style.contactUsText]}>Dont remember your email?</Text>
          <Text style={[font.CAPTION1_M, style.contactUsText]}>
            Contact us at <Text style={style.contactUsMailText}>help@crosshub.com</Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});
