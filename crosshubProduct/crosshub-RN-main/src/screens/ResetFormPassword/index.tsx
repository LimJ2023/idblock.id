import React, { memo, useCallback, useRef, useState } from 'react';

import { Keyboard, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Input, InputMessage } from '~/components/Input';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useApiPostResetPassword } from '~/hooks/api.post.reset.password';

import { MENU } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';

export const ResetFormPassword = memo(function ({ route }: Params) {
  const { uuid, mail, code } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [pw, setPw] = useState<string>('');
  const [pw2, setPw2] = useState<string>('');
  const [pwMessage, setPwMessage] = useState<InputMessage>();
  const [pw2Message, setPw2Message] = useState<InputMessage>();

  const { apiPostResetPassword } = useApiPostResetPassword();
  const { bottom } = useSafeAreaInsets();

  const pwRef = useRef<string>();

  if (pwRef.current !== pw) {
    pwRef.current = pw;
  }

  const pw2Ref = useRef<string>();

  if (pw2Ref.current !== pw2) {
    pw2Ref.current = pw2;
  }

  const handlePw = useCallback((text: string) => {
    setPwMessage(undefined);
    setPw(text);
  }, []);

  const handlePw2 = useCallback((text: string) => {
    setPw2Message(undefined);
    setPw2(text);
  }, []);

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();

    let isValid = true;

    if (!pwRef.current) {
      isValid = false;

      setPwMessage({
        text: 'Please enter password.',
        color: COLOR.ERROR,
      });
    } else if (!Util.regexPassword(pwRef.current)) {
      isValid = false;

      setPwMessage({
        text: 'Password must contain 8-15 characters with the combination of letters, numbers, and special characters (!@#$%^&*()).',
        color: COLOR.ERROR,
      });
    }

    if (!pw2Ref.current) {
      isValid = false;

      setPw2Message({
        text: 'Please enter password again.',
        color: COLOR.ERROR,
      });
    }

    if (pwRef.current && pw2Ref.current && pwRef.current !== pw2Ref.current) {
      isValid = false;

      setPw2Message({
        text: 'Password does not match.',
        color: COLOR.ERROR,
      });
    }

    if (!isValid) {
      return;
    }

    const isSuccess = await apiPostResetPassword({
      uuid,
      password: pwRef.current,
      passwordCheck: pwRef.current,
    });

    if (isSuccess) {
      navigation.push(MENU.STACK.SCREEN.RESET_FORM_RESULT, {
        uuid,
        mail,
        code,
        pw,
        pw2,
      });
    }
  }, []);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <Header title="New Password" />
      <KeyboardAwareScrollView
        contentContainerStyle={style.body}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={110}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
        enableOnAndroid={true}>
        <View style={style.bodyContent}>
          <View style={style.formWrap}>
            <Text style={[font.BODY2_M, style.labelText]}>Password</Text>
            <Input
              secureTextEntry={true}
              value={pw}
              placeholder="Enter New Password"
              wrapperStyle={style.inputWrapper}
              message={pwMessage}
              onChangeText={handlePw}
            />
            <Text style={[font.BODY2_M, style.labelText]}>Enter Password Again</Text>
            <Input
              secureTextEntry={true}
              value={pw2}
              placeholder="Confirm Password"
              wrapperStyle={style.inputWrapper}
              message={pw2Message}
              onChangeText={handlePw2}
            />
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button style={style.nextButton} onPress={handleNext}>
            <Text style={[font.BODY3_SB, style.nextButtonText]}>Reset</Text>
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
  code: string;
}
