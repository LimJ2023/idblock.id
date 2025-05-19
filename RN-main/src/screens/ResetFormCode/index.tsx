import React, { memo, useCallback, useRef, useState } from 'react';

import { Keyboard, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';

import { Input, InputMessage } from '~/components/Input';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Alert } from '~/components/Alert';
import { Text } from '~/components/Text';

import { useApiPostResetConfirm } from '~/hooks/api.post.reset.confirm';
import { useApiPostResetVerify } from '~/hooks/api.post.reset.verify';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const ResetFormCode = memo(function ({ route }: Params) {
  const { uuid, mail } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [codeMessage, setCodeMessage] = useState<InputMessage>();

  const { apiPostResetConfirm } = useApiPostResetConfirm();
  const { apiPostResetVerify } = useApiPostResetVerify();
  const { bottom } = useSafeAreaInsets();

  const codeRef = useRef<string>();

  if (codeRef.current !== code) {
    codeRef.current = code;
  }

  const handleCode = useCallback((text: string) => {
    setCodeMessage(undefined);

    const value = text.trim().replace(/\./g, '');

    if (value.length > 6) {
      return;
    }

    if (value.length === 6) {
      Keyboard.dismiss();
    }

    setCode(value);
  }, []);

  const handleResend = useCallback(async () => {
    Keyboard.dismiss();

    setAlertMessage(message.SEND_CODE);
    setCode('');

    await apiPostResetVerify({
      email: mail,
    });
  }, []);

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();

    setAlertMessage('');

    const response = await apiPostResetConfirm({
      uuid,
      email: mail,
      code: codeRef.current,
    });

    if (!response?.isVerified) {
      setCodeMessage({
        text: 'The Verification Code is incorrect.',
        color: COLOR.ERROR,
      });

      return;
    }

    navigation.push(MENU.STACK.SCREEN.RESET_FORM_PASSWORD, {
      uuid,
      mail,
      code: codeRef.current,
    });
  }, []);

  const isVisibleNextButton = code.length === 6;

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <Alert isVisible={!!alertMessage} message={alertMessage} onOk={() => setAlertMessage('')} />
      <Header title="Verification" />
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
            <Text style={[font.SUBTITLE3_B, style.titleText]}>Enter Verification Code</Text>
            <Input
              keyboardType="decimal-pad"
              placeholder="Enter your verification code"
              wrapperStyle={style.formInputWrapper}
              containerStyle={[style.formInputContainer, { borderColor: codeMessage?.color || '#F5F5F6' }]}
              value={code}
              message={codeMessage}
              onChangeText={handleCode}
            />
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button
            style={[style.nextButton, { backgroundColor: isVisibleNextButton ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!isVisibleNextButton}
            onPress={handleNext}>
            <Text style={[font.BODY3_B, { color: isVisibleNextButton ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Continue</Text>
          </Button>
          <Button onPress={handleResend} duration={1000}>
            <Text style={[font.CAPTION1_M, style.guideText]}>
              If you didnt receive a code, <Text style={[font.CAPTION1_M, style.guideResendText]}>Resend</Text>
            </Text>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});

interface Params {
  route: Route<string, NavigationParams>;
}

interface NavigationParams {
  uuid: string;
  mail: string;
}

const message = {
  SEND_CODE: 'We sent the Verification Code!\nPlease check your email.',
};
