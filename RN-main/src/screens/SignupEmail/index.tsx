import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Keyboard, Platform, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { Input, InputMessage } from '~/components/Input';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Alert } from '~/components/Alert';
import { Text } from '~/components/Text';

import { useAppRootAction } from '~/zustands/app';

import { useApiPostMailConfirm } from '~/hooks/api.post.mail.confirm';
import { useApiPostMailVerify } from '~/hooks/api.post.mail.verify';
import { useApiPostAuthSignup } from '~/hooks/api.post.auth.signup';
import { MENU, MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

export const SignupEmail = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [alertMessage, setAlertMessage] = useState<string>('');

  const [isVisibleVerifyButton, setIsVisibleVerifyButton] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [mail, setMail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordMessage, setPasswordMessage] = useState<InputMessage>();
  const [codeMessage, setCodeMessage] = useState<InputMessage>();
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [passwordConfirmMessage, setPasswordConfirmMessage] = useState<InputMessage>();
  const { bottom } = useSafeAreaInsets();
  const { setIsVisibleLoading } = useAppRootAction();

  const { apiPostMailConfirm } = useApiPostMailConfirm();
  const { apiPostMailVerify } = useApiPostMailVerify();
  const { apiPostAuthSignupSimple} = useApiPostAuthSignup();
  const mailRef = useRef<string>();
  const passwordRef = useRef<string>();
  const passwordConfirmRef = useRef<string>();

  if (mailRef.current !== mail) {
    mailRef.current = mail;
  }

  if (passwordRef.current !== password) {
    passwordRef.current = password;
  }

  if (passwordConfirmRef.current !== passwordConfirm) {
    passwordConfirmRef.current = passwordConfirm;
  }

  const codeRef = useRef<string>();

  if (codeRef.current !== code) {
    codeRef.current = code;
  }

  const uuidRef = useRef<string>('');

  const handleMail = useCallback((text: string) => {
    const value = text.trim();

    if (value) {
      uuidRef.current = '';

      setIsVisibleVerifyButton(Util.regexEmail(value));
      setIsVerified(false);
    }

    setMail(value);
  }, []);

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

  const handleVerify = useCallback(async () => {
    try {
      setIsVisibleLoading(true);

      uuidRef.current = '';

      Keyboard.dismiss();

      const verifyResult = await apiPostMailVerify({
        email: mailRef.current,
      });

      await Util.sleep(MODAL_ANIMATION_TIMING);

      setIsVisibleLoading(false);

      await Util.sleep(MODAL_ANIMATION_TIMING + 500);

      if (verifyResult?.uuid) {
        uuidRef.current = verifyResult.uuid;

        setIsVisibleVerifyButton(false);
        setAlertMessage(message.SEND_CODE);
        setIsVerified(true);
      } else {
        setAlertMessage(message.ALREADY_EXIST);
      }
    } finally {
      setIsVisibleLoading(false);
    }
  }, []);
  const handlePassword = useCallback((text: string) => {
    setPasswordMessage(undefined);

    const value = text.trim();

    if (value.length < 8) {
      setPasswordMessage({
        text: message.PASSWORD_MESSAGE,
        color: COLOR.ERROR,
      });
    } else {
      setPasswordMessage(undefined);
    }
    setPassword(value);
  }, []);
  const handlePasswordConfirm = useCallback((text: string) => {
    setPasswordConfirmMessage(undefined);
    const value = text.trim();

    if (value !== password) {
      setPasswordConfirmMessage({
        text: message.PASSWORD_CONFIRM_MESSAGE,
        color: COLOR.ERROR,
      });
    } else {
      setPasswordConfirmMessage(undefined);
    }
    setPasswordConfirm(value);
  }, [password])

  const handleNext = useCallback(async () => {
    try {
      setIsVisibleLoading(true);

      const isConfirm = await apiPostMailConfirm({
        email: mailRef.current,
        code: codeRef.current,
        uuid: uuidRef.current,
      });

      if (isConfirm && password === passwordConfirm) {
        setIsVisibleLoading(false);
        setAlertMessage('');

        const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_EMAIL);
        
        if (nextScreen) {
          navigation.push(nextScreen, {
            uuid: uuidRef.current,
            mail: mailRef.current,
          });
        } else {
          console.warn('No next screen found in signup flow');
        }
      }
    } catch (error) {
      console.log(error);

      setCodeMessage({
        text: 'The Verification Code is incorrect.',
        color: COLOR.ERROR,
      });
    } finally {
      setIsVisibleLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async () => {
    try {
      setIsVisibleLoading(true);

      const isSignUp = await apiPostAuthSignupSimple( {
        email: mailRef.current,
        password: passwordRef.current
      })
      console.log('isSignUp : ', isSignUp);
      if (isSignUp) {
        const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_EMAIL);

        if (nextScreen) {
          console.log('email 전송직전 : ', mailRef.current);
          navigation.push(nextScreen, {
            uuid: uuidRef.current,
            email: mailRef.current,
            pw: passwordRef.current,
          });
        } else {
          console.warn('No next screen found in signup flow');
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsVisibleLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      uuidRef.current = '';
    };
  }, []);

  const isVisibleNextButton = isVerified && code.length === 6;

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <Alert isVisible={!!alertMessage} message={alertMessage} onOk={() => setAlertMessage('')} />
      <Header />
      <KeyboardAwareScrollView
        contentContainerStyle={style.body}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.select({
          android: 110,
          ios: 70,
        })}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
        enableOnAndroid={true}>
        <View style={style.bodyContent}>
          <View style={style.titleWrap}>
            <Text style={[font.SUBTITLE1, style.titleText]}>Sign Up</Text>
          </View>
          <View style={style.formWrap}>
            <Text style={[font.BODY2_M, style.labelText]}>Email Verification</Text>
            <Input
              keyboardType="email-address"
              value={mail}
              placeholder="Email Address"
              wrapperStyle={style.inputWrapper}
              onChangeText={handleMail}
            />
                        <Button
              style={[style.verifyButton, { backgroundColor: isVisibleVerifyButton ? COLOR.PRI_2_500 : COLOR.PRI_2_200 }]}
              disabled={!isVisibleVerifyButton}
              onPress={handleVerify}>
              <Text style={[font.BODY3_SB, { color: isVisibleVerifyButton ? COLOR.GRAY_100 : COLOR.GRAY_600 }]}>
                Send Verification Code
              </Text>
            </Button>
            <Text style={[font.BODY2_M, style.labelText]}>Enter Password</Text>
              <Input
              secureTextEntry={true}
              value={password}
              placeholder="Enter Password"
              wrapperStyle={style.inputWrapper}
              message={passwordMessage}
              onChangeText={handlePassword}
              />
              <Text style={[font.BODY2_M, style.labelText]}>Password Confirmation</Text>
              <Input
                secureTextEntry={true}
                value={passwordConfirm}
                placeholder='Confirm Password'
                wrapperStyle={style.inputWrapper}
                message={passwordConfirmMessage}
                onChangeText={handlePasswordConfirm}
              />

            <Text style={[font.BODY2_M, style.labelText]}>Enter Verification Code</Text>
            <Input
              keyboardType="decimal-pad"
              value={code}
              placeholder="6-Digit Verification Code"
              wrapperStyle={style.inputWrapper}
              message={codeMessage}
              onChangeText={handleCode}
            />

          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button
            style={[style.nextButton, { backgroundColor: isVisibleNextButton ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!isVisibleNextButton}
            onPress={handleSignUp}>
            <Text style={[font.BODY3_SB, { color: isVisibleNextButton ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Sign Up</Text>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});

const message = {
  SEND_CODE: 'We sent the Verification Code!\nPlease check your email.',
  ALREADY_EXIST: 'This email address is already in use.',
  PASSWORD_MESSAGE: 'Password must be at least 8 characters long.',
  PASSWORD_CONFIRM_MESSAGE: 'Passwords do not match.'
};
