import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { MainLogo } from '~/components/MainLogo';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Text } from '~/components/Text';

import { useAccessToken, useAppRootAction } from '~/zustands/app';

import { useApiPostAuthSignin } from '~/hooks/api.post.auth.signin';

import { KEY_STORAGE, MENU } from '~/utils/constant';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';
import { CheckBox } from '~/components/CheckBox';
import { COLOR } from '~/utils/guide';
import FastImage from 'react-native-fast-image';

export const Signin = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [id, setId] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [signinMessage, setSigninMessage] = useState<string>('');
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const { setAccessToken, setRefreshToken } = useAppRootAction();
  const { accessToken } = useAccessToken();

  const { apiPostAuthSignin } = useApiPostAuthSignin();

  const idRef = useRef<string>();

  if (idRef.current !== id) {
    idRef.current = id;
  }

  const pwRef = useRef<string>();

  if (pwRef.current !== pw) {
    pwRef.current = pw;
  }

  const handleId = useCallback((text: string) => {
    setId(text.trim());
  }, []);

  const handlePw = useCallback((text: string) => {
    setPw(text.trim());
  }, []);

  useEffect(() => {
    Util.get(KEY_STORAGE.AUTH_EMAIL).then((email) => {
      if (email) {
        setId(email);
        setRememberMe(true);
      }
    });
  }, []);

  const handleSignin = useCallback(async () => {
    try {
      const signinResult = await apiPostAuthSignin({
        email: idRef.current,
        password: pwRef.current,
      });

      if (signinResult.accessToken && signinResult.refreshToken) {
        if (rememberMe) {
          await Util.set(KEY_STORAGE.AUTH_EMAIL, idRef.current);
        } else {
          await Util.set(KEY_STORAGE.AUTH_EMAIL, null);
        }
        if (autoLogin) {
          await Util.set(KEY_STORAGE.ACCESS_TOKEN, signinResult.accessToken);
          await Util.set(KEY_STORAGE.REFRESH_TOKEN, signinResult.refreshToken);
        }

        setAccessToken(signinResult.accessToken);
        setRefreshToken(signinResult.refreshToken);
      } else {
        setSigninMessage('The email or the password is incorrect');
      }
    } catch (error) {
      setSigninMessage('The email or the password is incorrect');
    }
  }, [autoLogin, rememberMe]);

  const handleSignup = useCallback(() => {
    setId('');
    setPw('');
    setSigninMessage(undefined);

    navigation.push(MENU.STACK.SCREEN.SIGNUP_EMAIL);
  }, []);

  const handleReset = useCallback(() => {
    setId('');
    setPw('');
    setSigninMessage(undefined);

    navigation.push(MENU.STACK.SCREEN.RESET_FORM_EMAIL);
  }, []);

  useEffect(() => {
    if (accessToken) {
      navigation.replace(MENU.STACK.SCREEN.MAIN);
    }
  }, [accessToken]);

  return (
    <View style={style.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.body}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={110}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
        enableOnAndroid={true}>
        {/* <MainLogo /> */}

        <View style={{ flex: 1, position: 'relative', height: 340, marginTop: 40 }}>
          <FastImage source={require('~/assets/images/login-banner.png')} style={{ width: '100%', height: 340 }} />
          <View style={{ paddingHorizontal: 20, position: 'absolute', bottom: 0, left: 0 }}>
            <Text style={[font.SUBTITLE1, { color: COLOR.GRAY_900, letterSpacing: -0.5 }]}>IDBLOCK</Text>
            <Text style={[font.BODY1_R, { color: COLOR.GRAY_900 }]}>
              Connecting the World{'\n'}
              Through Seamless Authentication
            </Text>
          </View>
        </View>
        <View style={style.formWrap}>
          <Input
            keyboardType="email-address"
            placeholder="Email Address"
            wrapperStyle={style.formInputWrapper}
            containerStyle={style.formInputContainer}
            value={id}
            onChangeText={handleId}
          />
          <Input
            placeholder="Password"
            wrapperStyle={style.formInputWrapper}
            containerStyle={style.formInputContainer}
            value={pw}
            secureTextEntry={true}
            onChangeText={handlePw}
          />

          {!!signinMessage && (
            <View style={style.messageTextWrap}>
              <Text style={[font.CAPTION1_M, style.messageText]}>{signinMessage}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 40, marginVertical: 0, paddingBottom: 14, paddingTop: 10 }}>
            <CheckBox
              initChecked={autoLogin}
              onChecked={setAutoLogin}
              rightChild={<Text style={[font.INPUT2, { color: COLOR.GRAY_800 }]}>Auto Login</Text>}
            />
            <CheckBox
              initChecked={rememberMe}
              onChecked={setRememberMe}
              rightChild={<Text style={[font.INPUT2, { color: COLOR.GRAY_800 }]}>Remember Me</Text>}
            />
          </View>

          <Button style={[style.button, style.signinButton]} onPress={handleSignin}>
            <Text style={[font.BODY3_SB, style.buttonText]}>Login</Text>
          </Button>
          <Button style={[style.button, style.signupButton]} onPress={handleSignup}>
            <Text style={[font.BODY3_SB, style.buttonText]}>Sign Up</Text>
          </Button>
          <View style={style.footer}>
            <Button style={style.resetButton} onPress={handleReset}>
              <Text style={[font.CAPTION1_R, style.resetButtonText]}>Forgot Username/Password</Text>
            </Button>
            {/* <FastImage source={STATIC_IMAGE.LOGO_IMAGE} style={style.logoImage} resizeMode="contain" /> */}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});
