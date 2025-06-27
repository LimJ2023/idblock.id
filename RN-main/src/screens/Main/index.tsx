import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Platform, ScrollView, TextStyle, View, ViewStyle } from 'react-native';

import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '@react-native-firebase/messaging';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import FastImage, { Source } from 'react-native-fast-image';
import DeviceInfo from 'react-native-device-info';
import Modal from 'react-native-modal';

import { MainLogo } from '~/components/MainLogo';
import { Button } from '~/components/Button';
import { ModalConfirm } from '~/components/ModalConfirm';
import { Alert } from '~/components/Alert';
import { Text } from '~/components/Text';

import { useAccessToken, useAppRootAction, useIsBiometricsSigned } from '~/zustands/app';
import { useProfile, useUserAction } from '~/zustands/user';
import { useHttp } from '~/zustands/http';

import { useApiPostNotificationFcm } from '~/hooks/api.post.notification.fcm';
import { useApiDeleteAuthSignout } from '~/hooks/api.delete.auth.signout';
import { useApiGetAuthProfile } from '~/hooks/api.get.auth.profile';
import { usePermissionCheck } from '~/hooks/permission.check';
import { useBiometricsAuth } from '~/hooks/biometrics.auth';

import { MENU, MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';
import { PROFILE_STATUS } from '~/types/enum';
import { font, globalStyle } from '~/style';
import { Profile } from '~/types/profile';
import { COLOR } from '~/utils/guide';
import Util from '~/utils/common';

import style from './style';

export const Main = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isVisibleMenu, setIsVisibleMenu] = useState<boolean>(false);
  const [isVisiblePassportConfirm, setIsVisiblePassportConfirm] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  const { setIsBiometricsSigned } = useAppRootAction();
  const { setProfile } = useUserAction();
  const { signout } = useHttp();
  const { isBiometricsSigned } = useIsBiometricsSigned();
  const { accessToken } = useAccessToken();
  const { profile } = useProfile();

  const { isAbleBiometrics, reqBiometricsLogin } = useBiometricsAuth();
  const { apiPostNotificationFcm } = useApiPostNotificationFcm();
  const { notificationPermissionCheck } = usePermissionCheck();
  const { apiDeleteAuthSignout } = useApiDeleteAuthSignout();
  const { apiGetAuthProfile } = useApiGetAuthProfile();

  const isBiometricsSignedRef = useRef<boolean>();

  if (isBiometricsSignedRef.current !== isBiometricsSigned) {
    isBiometricsSignedRef.current = isBiometricsSigned;
  }

  const accessTokenRef = useRef<string>();

  if (accessTokenRef.current !== accessToken) {
    accessTokenRef.current = accessToken;
  }

  const profileRef = useRef<Profile>();

  if (profileRef.current !== profile) {
    profileRef.current = profile;
  }

  const appVersion = useRef<string>(DeviceInfo.getVersion()).current;

  const handleAlarm = useCallback(() => {
    navigation.push(MENU.STACK.SCREEN.ALARM);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsVisibleMenu(false);
  }, []);

  const handleMenu = useCallback(() => {
    setIsVisibleMenu(true);
  }, []);

  const handleSignout = useCallback(async () => {
    setIsVisibleMenu(false);

    apiDeleteAuthSignout();
    await signout();

    navigation.replace(MENU.STACK.SCREEN.SIGNIN);
  }, []);

  const handleBiometrics = useCallback(async () => {
    if (isBiometricsSignedRef.current) {
      return true;
    }

    const result = await isAbleBiometrics();

    if (result === 'NOT_AVAILABLE') {
      setAlertMessage('Security authentication for the device not found');
      return false;
    }

    if (result !== 'ERROR') {
      const isSuccess = await reqBiometricsLogin();

      if (isSuccess) {
        setIsBiometricsSigned(true);
      }

      return isSuccess;
    }

    return false;
  }, []);

  const handleId = useCallback(async () => {
    const isLoggedin = await handleBiometrics();

    if (isLoggedin) {
      const profile = await apiGetAuthProfile();

      console.log('profile : ', profile);
      let navigationMenu = '';

      switch (profile.status) {
        case PROFILE_STATUS.APPROVED: {
          navigationMenu = MENU.STACK.SCREEN.ID_CARD;
          break;
        }
        case PROFILE_STATUS.PENDING: {
          navigationMenu = MENU.STACK.SCREEN.ID_CARD_PENDING;
          break;
        }
        case PROFILE_STATUS.REJECTED: {
          navigationMenu = MENU.STACK.SCREEN.ID_CARD_DENIED;
          break;
        }
      }

      if (navigationMenu) {
        navigation.push(navigationMenu);
      }
    }
  }, []);

  const handleQr = useCallback(async () => {
    if (profileRef.current?.status !== PROFILE_STATUS.APPROVED) {
      return;
    }

    const isLoggedin = await handleBiometrics();

    if (isLoggedin) {
      navigation.push(MENU.STACK.SCREEN.QR);
    }
  }, []);

  const handleHistory = useCallback(async () => {
    if (profileRef.current?.status !== PROFILE_STATUS.APPROVED) {
      return;
    }

    const isLoggedin = await handleBiometrics();

    if (isLoggedin) {
      navigation.push(MENU.STACK.SCREEN.HISTORY);
    }
  }, []);

  const handlePassportStart = useCallback(() => {
    // 여권 인증 확인 모달 열기
    setIsVisiblePassportConfirm(true);
  }, []);

  const handlePassportConfirmCancel = useCallback(() => {
    setIsVisiblePassportConfirm(false);
  }, []);

  const handlePassportConfirmOk = useCallback(() => {
    setIsVisiblePassportConfirm(false);
    // 여권 인증 시작 - SignupPassport 화면으로 이동
    console.log('handlePassportConfirm profile : ', profile);
    navigation.push(MENU.STACK.SCREEN.SIGNUP_PASSPORT, {
      uuid: '',
      email: profile?.email || '',
      pw: '',
      name: profile?.name || '',
      country: '',
      honorary: '',
      birth: profile?.birthday || '',
      passport: '',
    });
  }, [profile]);

  const handleNotificationCallback = useCallback((notification: FirebaseMessagingTypes.RemoteMessage, callback: Function) => {
    /*
     * 푸시 관련 공통 핸들링 (푸시 받은 경우 | 클릭 여부)
     */
    const notificationData = notification.data;

    if (notificationData) {
      let data;

      if (typeof notificationData === 'object') {
        data = notificationData;
      } else if (typeof notificationData === 'string') {
        data = JSON.parse(notificationData);
      } else if (!(notificationData as any)?.notificationLinkType) {
        data = {};
      }

      if (data) {
        callback(data);
      }
    }
  }, []);

  const initPush = useCallback(() => {
    PushNotification.configure({
      popInitialNotification: true,
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: true,
      onNotification: (notification) => {
        /*
         * Foreground & Background
         * userInteraction 으로 클릭 했는지 여부 알 수 있음
         */
        if (notification.userInteraction) {
          handleNotificationCallback(notification, () => {
            if (accessTokenRef.current) {
              navigation.push(MENU.STACK.SCREEN.ALARM);
            }
          });
        }
      },
    });

    PushNotification.createChannel(
      {
        channelId: 'idblock-push-notification',
        channelName: 'IDBlock Push Channel',
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      () => {},
    );

    Util.pushListener({
      backgroundCallback: (notification: FirebaseMessagingTypes.RemoteMessage) => {
        /*
         * Background 푸시 수신시
         */
      },
      foregroundCallback: (notification: FirebaseMessagingTypes.RemoteMessage) => {
        /*
         * Foreground 푸시 수신시
         */
      },
      dataCallback: (data) => {
        /*
         * 데이터 메시지 수신시
         */
      },
    });
  }, []);

  const MemoizedMainButton = useCallback(
    (icon: Source, text: string, callback: () => void, buttonStyle?: ViewStyle, textStyle?: TextStyle) => (
      <Button style={[style.mainButton, buttonStyle || {}]} onPress={callback}>
        <FastImage source={icon} style={style.mainButtonImage} resizeMode="contain" />
        <Text style={[font.BODY1_M, style.mainButtonText, textStyle || {}]}>{text}</Text>
      </Button>
    ),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        console.log(`[${Platform.OS}] ACCESS_TOKEN = ${accessToken}`);

        apiGetAuthProfile()
          .then((profile) => {
            console.log('Profile loaded successfully:', profile);
            /*
             * 푸시 토큰 설정 (권한 요청 및 토큰 등록)
             */
            notificationPermissionCheck().then(async (currentPermissionStatus) => {
              if (['granted', 'limited'].includes(currentPermissionStatus)) {
                initPush();

                const token = await firebase.messaging().getToken();

                console.log(`PUSH_TOKEN = ${token}`);

                apiPostNotificationFcm({
                  fcmToken: token,
                });
              }
            });

            setProfile(profile);
          })
          .catch((error) => {
            console.log('Profile API failed:', error);
            // 401 에러 등 인증 실패 시 로그인 화면으로 이동
            if (error?.statusCode === 401 || error?.status === 401) {
              console.log('Token expired, redirecting to signin');
              signout().then(() => {
                navigation.replace(MENU.STACK.SCREEN.SIGNIN);
              });
            }
          });
      } else {
        navigation.popToTop();
        navigation.replace(MENU.STACK.SCREEN.SIGNIN);
      }
    }, [accessToken]),
  );

  useEffect(() => {
    return () => {
      if (Util.unsubscribeMessaging) {
        Util.unsubscribeMessaging();
      }

      if (Util.unsubscribeNotification) {
        Util.unsubscribeNotification();
      }

      PushNotification.cancelAllLocalNotifications();
    };
  }, []);

  useEffect(() => {
    console.log('Profile state changed:', profile);
  }, [profile]);

  return (
    <View style={style.container}>
      <Alert isVisible={!!alertMessage} message={alertMessage} onOk={() => setAlertMessage('')} />
      <ModalConfirm
        isVisible={isVisiblePassportConfirm}
        title="Passport Authentication"
        message={`Would you like to start passport authentication? ${'\n'}We will verify your identity using your passport information.`}
        cancelText="Cancel"
        confirmText="Confirm"
        onCancel={handlePassportConfirmCancel}
        onConfirm={handlePassportConfirmOk}
      />
      <Modal
        isVisible={isVisibleMenu}
        style={globalStyle.modal}
        statusBarTranslucent={true}
        backdropColor="transparent"
        animationIn="slideInRight"
        animationInTiming={MODAL_ANIMATION_TIMING}
        animationOut="slideOutRight"
        animationOutTiming={MODAL_ANIMATION_TIMING}
        onBackButtonPress={handleMenuClose}>
        <View style={style.menuContainer}>
          <View style={style.menuHeader}>
            <Button style={style.menuCloseButton} onPress={handleMenuClose}>
              <FastImage source={STATIC_IMAGE.CLOSE_WHITE} style={style.menuCloseButtonImage} resizeMode="contain" />
            </Button>
          </View>
          <View style={style.menuBody}>
            <View style={style.menuButtonWrap}>
              <Button style={style.menuButton} onPress={handleSignout}>
                <Text style={[font.SUBTITLE1, style.menuButtonText]}>Log Out</Text>
              </Button>
            </View>
            <Text style={[font.BODY1_SB, style.versionText]}>Version {appVersion}</Text>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={style.header}>
          <Button style={style.headerButton} onPress={handleAlarm}>
            <FastImage source={STATIC_IMAGE.ALARM} style={style.headerButtonImage} resizeMode="contain" />
          </Button>
          <Button style={style.headerButton} onPress={handleMenu}>
            <FastImage source={STATIC_IMAGE.MENU} style={style.headerButtonImage} resizeMode="contain" />
          </Button>
        </View>
        <View style={style.body}>
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
          <View style={style.buttonWrap}>
            {MemoizedMainButton(STATIC_IMAGE.MAIN_BUTTON_1, 'Mobile Identification', handleId)}
            {MemoizedMainButton(
              profile.status === PROFILE_STATUS.APPROVED ? STATIC_IMAGE.MAIN_BUTTON_2 : STATIC_IMAGE.MAIN_BUTTON_2_DISABLE,
              'QR Code',
              handleQr,
              profile.status !== PROFILE_STATUS.APPROVED ? { backgroundColor: COLOR.UI_COLOR_100 } : {},
              profile.status !== PROFILE_STATUS.APPROVED ? { color: '#777777' } : {},
            )}
            {MemoizedMainButton(
              profile.status === PROFILE_STATUS.APPROVED ? STATIC_IMAGE.MAIN_BUTTON_3 : STATIC_IMAGE.MAIN_BUTTON_3_DISABLE,
              'Visitor History',
              handleHistory,
              profile.status !== PROFILE_STATUS.APPROVED ? { backgroundColor: COLOR.UI_COLOR_100 } : {},
              profile.status !== PROFILE_STATUS.APPROVED ? { color: '#777777' } : {},
            )}
            {}
            {MemoizedMainButton(STATIC_IMAGE.MAIN_BUTTON_4, 'Passport Authentication', handlePassportStart)}
          </View>
          {/* <View style={style.footer}>
            <FastImage source={STATIC_IMAGE.LOGO_IMAGE} style={style.logoImage} resizeMode="contain" />
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
});
