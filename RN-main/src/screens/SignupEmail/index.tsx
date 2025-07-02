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
import { 
  useSignupEmailData, 
  useSignupAction, 
  useSignupErrorData,
  SignupStep
} from '~/zustands/signup';

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

  // Zustand store에서 데이터 가져오기
  const emailData = useSignupEmailData();
  const errorData = useSignupErrorData();
  const signupAction = useSignupAction();

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isVisibleVerifyButton, setIsVisibleVerifyButton] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<InputMessage>();
  const [codeMessage, setCodeMessage] = useState<InputMessage>();
  const [passwordConfirmMessage, setPasswordConfirmMessage] = useState<InputMessage>();
  
  const { bottom } = useSafeAreaInsets();
  const { setIsVisibleLoading } = useAppRootAction();

  const { apiPostMailConfirm } = useApiPostMailConfirm();
  const { apiPostMailVerify } = useApiPostMailVerify();
  const { apiPostAuthSignupSimple} = useApiPostAuthSignup();

  // 컴포넌트 마운트 시 현재 단계 설정
  useEffect(() => {
    signupAction.setCurrentStep(SignupStep.EMAIL);
  }, []);

  const handleMail = useCallback((text: string) => {
    const value = text.trim();

    if (value) {
      signupAction.setUuid('');
      setIsVisibleVerifyButton(Util.regexEmail(value));
      signupAction.setEmailVerified(false);
    }

    signupAction.setEmail(value);
  }, [signupAction]);

  const handleCode = useCallback((text: string) => {
    setCodeMessage(undefined);
    signupAction.setError('emailError', undefined);

    const value = text.trim().replace(/\./g, '');

    if (value.length > 6) {
      return;
    }

    if (value.length === 6) {
      Keyboard.dismiss();
    }

    signupAction.setVerificationCode(value);
  }, [signupAction]);

  const handleVerify = useCallback(async () => {
    try {
      setIsVisibleLoading(true);

      signupAction.setUuid('');
      Keyboard.dismiss();

      const verifyResult = await apiPostMailVerify({
        email: emailData.email,
      });

      await Util.sleep(MODAL_ANIMATION_TIMING);

      setIsVisibleLoading(false);

      await Util.sleep(MODAL_ANIMATION_TIMING + 500);

      if (verifyResult?.uuid) {
        signupAction.setUuid(verifyResult.uuid);
        signupAction.setCodeSent(true);
        setIsVisibleVerifyButton(false);
        setAlertMessage(message.SEND_CODE);
        signupAction.setEmailVerified(true);
      } else {
        setAlertMessage(message.ALREADY_EXIST);
      }
    } finally {
      setIsVisibleLoading(false);
    }
  }, [signupAction, emailData.email, apiPostMailVerify, setIsVisibleLoading]);

  const handlePassword = useCallback((text: string) => {
    setPasswordMessage(undefined);
    signupAction.setError('passwordError', undefined);

    const value = text.trim();

    if (value.length < 8) {
      setPasswordMessage({
        text: message.PASSWORD_MESSAGE,
        color: COLOR.ERROR,
      });
    } else {
      setPasswordMessage(undefined);
    }
    signupAction.setPassword(value);
  }, [signupAction]);

  const handlePasswordConfirm = useCallback((text: string) => {
    setPasswordConfirmMessage(undefined);
    signupAction.setError('passwordError', undefined);
    
    const value = text.trim();

    if (value !== emailData.password) {
      setPasswordConfirmMessage({
        text: message.PASSWORD_CONFIRM_MESSAGE,
        color: COLOR.ERROR,
      });
    } else {
      setPasswordConfirmMessage(undefined);
    }
    signupAction.setPasswordConfirm(value);
  }, [signupAction, emailData.password])

  // const handleNext = useCallback(async () => {
  //   try {
  //     setIsVisibleLoading(true);

  //     const isConfirm = await apiPostMailConfirm({
  //       email: mailRef.current,
  //       code: codeRef.current,
  //       uuid: uuidRef.current,
  //     });

  //     if (isConfirm && password === passwordConfirm) {
  //       setIsVisibleLoading(false);
  //       setAlertMessage('');

  //       const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_EMAIL);
        
  //       if (nextScreen) {
  //         navigation.push(nextScreen, {
  //           uuid: uuidRef.current,
  //           mail: mailRef.current,
  //         });
  //       } else {
  //         console.warn('No next screen found in signup flow');
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     setCodeMessage({
  //       text: 'The Verification Code is incorrect.',
  //       color: COLOR.ERROR,
  //     });
  //   } finally {
  //     setIsVisibleLoading(false);
  //   }
  // }, []);

  const handleSignUp = useCallback(async () => {
    //비밀번호 유효성 검사
    if(!Util.regexPassword(emailData.password)){
      setPasswordMessage({
        text: 'Password must contain 8-15 characters with the combination of letters, numbers, and special characters (!@#$%^&*()).',
        color: COLOR.ERROR,
      });
      signupAction.setError('passwordError', 'Invalid password format');
      return;
    }

    try {
      setIsVisibleLoading(true);

      const isSignUp = await apiPostAuthSignupSimple({
        email: emailData.email,
        password: emailData.password
      });
      
      console.log('isSignUp : ', isSignUp);
      if (isSignUp) {
        // 단계 완료 표시
        signupAction.completeStep(SignupStep.EMAIL);
        
        const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_EMAIL);

        if (nextScreen) {
          console.log('email 전송직전 : ', emailData.email);
          navigation.push(nextScreen, {
            uuid: emailData.uuid,
            email: emailData.email,
            pw: emailData.password,
          });
        } else {
          console.warn('No next screen found in signup flow');
        }
      }
    } catch (error) {
      console.log(error);
      signupAction.setError('emailError', '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsVisibleLoading(false);
    }
  }, [emailData, signupAction, apiPostAuthSignupSimple, setIsVisibleLoading, navigation]);

  const isVisibleNextButton = emailData.isEmailVerified && emailData.verificationCode.length === 6;

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
              value={emailData.email}
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
              value={emailData.password}
              placeholder="Enter Password"
              wrapperStyle={style.inputWrapper}
              message={passwordMessage}
              onChangeText={handlePassword}
              />
              <Text style={[font.BODY2_M, style.labelText]}>Password Confirmation</Text>
              <Input
                secureTextEntry={true}
                value={emailData.passwordConfirm}
                placeholder='Confirm Password'
                wrapperStyle={style.inputWrapper}
                message={passwordConfirmMessage}
                onChangeText={handlePasswordConfirm}
              />

            <Text style={[font.BODY2_M, style.labelText]}>Enter Verification Code</Text>
            <Input
              keyboardType="decimal-pad"
              value={emailData.verificationCode}
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
