import React, { memo, useCallback, useRef, useState } from 'react';

import { ScrollView, View, Image } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import { ModalFaceDetectCamera } from '~/components/ModalFaceDetectCamera';
import { ModalPermissionGuide } from '~/components/ModalPermissionGuide';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useAccessToken, useAppRootAction } from '~/zustands/app';

import { useApiPutAuthInformation } from '~/hooks/api.put.auth.information';
import { useApiPostAuthPassport } from '~/hooks/api.post.auth.passport';
import { useApiPostAuthSignup } from '~/hooks/api.post.auth.signup';
import { useApiPostAuthFace } from '~/hooks/api.post.auth.face';
import { usePermissionCheck } from '~/hooks/permission.check';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';

export const SignupFace = memo(function ({ route }: Params) {
  const { uuid, mail, pw, name, country, honorary, birth, passport, passportImage } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isVisiblePermission, setIsVisiblePermission] = useState<boolean>(false);
  const [isVisibleFaceDetectCamera, setIsVisibleFaceDetectCamera] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');

  const { setIsVisibleLoading } = useAppRootAction();
  const { accessToken } = useAccessToken();

  const { apiPutAuthInformation } = useApiPutAuthInformation();
  const { apiPostAuthPassport } = useApiPostAuthPassport();
  const { cameraPermissionCheck } = usePermissionCheck();
  const { apiPostAuthSignup } = useApiPostAuthSignup();
  const { apiPostAuthFace } = useApiPostAuthFace();
  const { bottom } = useSafeAreaInsets();

  const permissionRequestCount = useRef<number>(0);

  const imageRef = useRef<string>();

  if (imageRef.current !== image) {
    imageRef.current = image;
  }

  const accessTokenRef = useRef<string>();

  if (accessTokenRef.current !== accessToken) {
    accessTokenRef.current = accessToken;
  }

  const handleFaceDetectCamera = useCallback(() => {
    cameraPermissionCheck().then((result) => {
      if (result === 'granted') {
        setIsVisibleFaceDetectCamera(true);
      } else if (permissionRequestCount.current === 0) {
        permissionRequestCount.current = permissionRequestCount.current + 1;

        Toast.show('Permission to use camera has been denied.', Toast.SHORT);
      } else {
        setIsVisiblePermission(true);
      }
    });
  }, []);

  const handleDetect = useCallback((imagePath: string) => {
    setImage(imagePath);
  }, []);

  const handleNext = useCallback(async () => {
    try {
      setIsVisibleLoading(true);

      const passportUploadResult = await apiPostAuthPassport({
        formData: Util.getFileAppendedFormData(passportImage),
      });

      const faceUploadResult = await apiPostAuthFace({
        formData: Util.getFileAppendedFormData(imageRef.current),
      });

      if (passportUploadResult.key && faceUploadResult.key) {
        let isSuccessSignup = false;

        if (accessTokenRef.current) {
          isSuccessSignup = await apiPutAuthInformation({
            name,
            birthday: birth,
            countryCode: country,
            cityId: honorary,
            passportNumber: passport,
            passportImageKey: passportUploadResult.key,
            profileImageKey: faceUploadResult.key,
          });
        } else {
          isSuccessSignup = await apiPostAuthSignup({
            uuid,
            email: mail,
            password: pw,
            passwordCheck: pw,
            name,
            birthday: birth,
            countryCode: country,
            cityId: honorary,
            passportNumber: passport,
            passportImageKey: passportUploadResult.key,
            profileImageKey: faceUploadResult.key,
          });
        }

        setIsVisibleLoading(false);

        if (isSuccessSignup) {
          navigation.push(MENU.STACK.SCREEN.SIGNUP_RESULT);
        }
      }
    } finally {
      setIsVisibleLoading(false);
    }
  }, []);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalPermissionGuide
        isVisible={isVisiblePermission}
        text={`"CrossHub" has been denied access to Camera. You can enable permissions in`}
        onClose={() => setIsVisiblePermission(false)}
      />
      <ModalFaceDetectCamera
        isVisible={isVisibleFaceDetectCamera}
        onSubmit={handleDetect}
        onClose={() => setIsVisibleFaceDetectCamera(false)}
      />
      <Header title="Face Verification" />
      <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={style.body}>
          <View style={style.bodyContent}>
            <View style={style.guideWrap}>
              {image ? (
                <Image source={{ uri: image }} style={style.faceImage} resizeMode="contain" />
              ) : (
                <>
                  <FastImage source={STATIC_IMAGE.FACE_SYMBOL} style={style.faceSymbolImage} resizeMode="contain" />
                  <Text style={[font.SUBTITLE3_SB, style.faceSymbolText]}>Take a photo for{'\n'}Face Verification</Text>
                </>
              )}
              {image ? (
                <View style={style.registeredImage}>
                  <View style={style.registeredImageWrap}>
                    <Text style={[font.CAPTION1_R, style.registeredImageText]}>Face verification is completed successfully</Text>
                    <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_GREEN} style={style.registeredImageIcon} resizeMode="contain" />
                  </View>
                </View>
              ) : (
                <View style={style.guideContentWrap}>
                  <Text style={[font.BODY2_B, style.guideContentTitleText]}>Guidelines for Face Verification</Text>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>Avoid harsh lighting that can cause glare.</Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>A plain, neutral background that constrast with your face.</Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>
                      Frontal view of the face, with eyes open and a netural expression.
                    </Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>
                      Full visibility of the face, including eyes, nose, mouth and ears.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View style={style.nextButtonWrap}>
            <Button style={style.cameraButton} onPress={handleFaceDetectCamera}>
              <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
              <Text style={[font.BODY3_SB, style.cameraButtonText]}>{image ? 'Retake a photo' : 'Take a photo'}</Text>
            </Button>
            <Button
              style={[style.nextButton, { backgroundColor: image ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
              disabled={!image}
              onPress={handleNext}>
              <Text style={[font.BODY3_SB, { color: image ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Request Approval</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

interface Params {
  route: Route<string, NavigationParams>;
}

interface NavigationParams {
  uuid: string;
  mail: string;
  pw: string;
  name: string;
  birth: string;
  passport: string;
  country: string;
  honorary: string;
  passportImage: string;
}
