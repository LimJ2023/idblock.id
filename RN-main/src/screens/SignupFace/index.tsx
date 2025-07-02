import React, { memo, useCallback, useRef, useState, useEffect } from 'react';

import { ScrollView, View, Image } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import { launchImageLibrary } from 'react-native-image-picker';

import { ModalFaceDetectCamera } from '~/components/ModalFaceDetectCamera';
import { ModalPermissionGuide } from '~/components/ModalPermissionGuide';
import { ProgressBar } from '~/components/ProgressBar';
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
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

export const SignupFace = memo(function ({ route }: Params) {
  const { uuid, email, pw, name, country, honorary, birth, passport, passportImage } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isVisiblePermission, setIsVisiblePermission] = useState<boolean>(false);
  const [isVisibleFaceDetectCamera, setIsVisibleFaceDetectCamera] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');
  const [progressVisible, setProgressVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');

  const { setIsVisibleLoading } = useAppRootAction();
  const { accessToken } = useAccessToken();

  const { apiPutAuthInformation } = useApiPutAuthInformation();
  const { apiPostAuthPassport } = useApiPostAuthPassport();
  const { cameraPermissionCheck } = usePermissionCheck();
  const { apiPostAuthSignup } = useApiPostAuthSignup();
  const { apiPostAuthFace } = useApiPostAuthFace();
  const { galleryPermissionCheck } = usePermissionCheck();
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

  // 개발 모드에서 자동으로 더미 이미지 설정
  useEffect(() => {
    if (__DEV__ && !image) {
      console.log('🎭 개발 모드: 더미 얼굴 이미지 자동 설정');
      // public 폴더의 더미 이미지를 사용
      setImage('file:///android_asset/public/pexels-justin-shaifer-501272-1222271.jpg');
    }
  }, [image]);

  const handleMockImage = useCallback(() => {
    // public 폴더의 더미 이미지를 사용
    setImage('file:///android_asset/public/pexels-justin-shaifer-501272-1222271.jpg');
    console.log('🎭 개발 모드: Mock 이미지 설정 완료');
  }, []);

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

  const handleGalleryPicker = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            setImage(asset.uri);
          }
        }
      },
    );
  }, []);

  const stepLabels = ['Passport Image Upload', 'Face Image Upload', 'Processing Registration', 'Complete'];

  const handleNext = useCallback(async () => {
    try {
      setProgressVisible(true);
      setCurrentStep(0);
      setCurrentStepText('Verifying images before upload...');

      // 필수 데이터 검증
      if (!passportImage) {
        Toast.show('Passport image is required', Toast.SHORT);
        return;
      }

      if (!imageRef.current) {
        Toast.show('Face image is required', Toast.SHORT);
        return;
      }

      // 1단계: 여권 이미지 업로드
      setCurrentStep(1);
      setCurrentStepText('Uploading passport image...');
      let passportUploadResult: any;
      try {
        passportUploadResult = await apiPostAuthPassport({
          formData: Util.getFileAppendedFormData(passportImage),
        });
      } catch (error) {
        if (error?.code === 'ECONNABORTED') {
          Toast.show('Passport image upload timed out. Please try again.', Toast.SHORT);
        } else if (error?.code === 'ERR_NETWORK') {
          Toast.show('Please check your network connection.', Toast.SHORT);
        } else {
          Toast.show('Passport image upload failed. Please try again.', Toast.SHORT);
        }
        return;
      }

      // 2단계: 얼굴 이미지 업로드
      setCurrentStep(2);
      setCurrentStepText('Uploading face image...');
      let faceUploadResult: any;
      try {
        faceUploadResult = await apiPostAuthFace({
          formData: Util.getFileAppendedFormData(imageRef.current),
        });
      } catch (error) {
        if (error?.code === 'ECONNABORTED') {
          Toast.show('Face image upload timed out. Please try again.', Toast.SHORT);
        } else if (error?.code === 'ERR_NETWORK') {
          Toast.show('Please check your network connection.', Toast.SHORT);
        } else {
          Toast.show('Face image upload failed. Please try again.', Toast.SHORT);
        }
        return;
      }

      if (passportUploadResult?.key && faceUploadResult?.key) {
        // 3단계: 회원가입 처리
        setCurrentStep(3);
        setCurrentStepText('Processing registration...');
        let isAutoApproval = false;
        try {
          if (accessTokenRef.current) {
            isAutoApproval = await apiPutAuthInformation({
              name,
              birthday: birth,
              countryCode: country,
              cityId: honorary,
              passportNumber: passport,
              passportImageKey: passportUploadResult.key,
              profileImageKey: faceUploadResult.key,
            });
          } else {
            isAutoApproval = await apiPostAuthSignup({
              uuid,
              email: email,
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
        } catch (error) {
          if (error?.code === 'ECONNABORTED') {
            Toast.show('Request timed out. Please try again.', Toast.SHORT);
          } else if (error?.code === 'ERR_NETWORK') {
            Toast.show('Network connection error. Unable to connect to server.', Toast.SHORT);
          } else {
            Toast.show('Server processing error occurred. Please try again.', Toast.SHORT);
          }
          return;
        }

          // 4단계: 완료
          setCurrentStep(4);
          setCurrentStepText('Registration completed successfully. Moving to next screen...');

          // 약간의 지연 후 화면 이동 (완료 상태를 보여주기 위해)
          setTimeout(() => {
            try {
              if (isAutoApproval) {
                navigation.push(MENU.STACK.SCREEN.SIGNUP_AUTO_APPROVAL);
                return;
              }
              const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_FACE);

              if (nextScreen) {
                navigation.push(nextScreen);
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: MENU.STACK.SCREEN.MAIN }],
                });
              }
            } catch (navError) {
              Toast.show('An error occurred while navigating to the next screen.', Toast.SHORT);
            }
          }, 1000);
        
      } else {
        Toast.show('File upload failed. Please try again.', Toast.SHORT);
      }
    } catch (error) {
      if (error?.code === 'ECONNABORTED') {
        Toast.show('Request timed out. Please check your network status.', Toast.SHORT);
      } else if (error?.code === 'ERR_NETWORK') {
        Toast.show('Network connection error. Please check your internet connection.', Toast.SHORT);
      } else {
        Toast.show('An error occurred. Please try again.', Toast.SHORT);
      }
    } finally {
      setProgressVisible(false);
      setCurrentStep(0);
      setCurrentStepText('');
    }
  }, [uuid, email, pw, name, birth, country, honorary, passport, passportImage, navigation]);

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
      <ProgressBar
        isVisible={progressVisible}
        currentStep={currentStep}
        totalSteps={stepLabels.length}
        stepLabels={stepLabels}
        currentStepText={currentStepText}
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
            {__DEV__ && (
              <Button style={[style.cameraButton, { marginTop: 10, backgroundColor: COLOR.PRI_2_500 }]} onPress={handleMockImage}>
                <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
                <Text style={[font.BODY3_SB, style.cameraButtonText]}>Set Mock Image (Dev)</Text>
              </Button>
            )}

            <Button
              style={[style.nextButton, { backgroundColor: image ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
              disabled={!image}
              onPress={handleNext}>
              <Text style={[font.BODY3_SB, { color: image ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Request Approval</Text>
            </Button>
            <Button style={[style.cameraButton, { marginTop: 10, backgroundColor: COLOR.PRI_3_500 }]} onPress={handleGalleryPicker}>
              <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
              <Text style={[font.BODY3_SB, style.cameraButtonText]}>Choose Mock Image from Gallery (Dev)</Text>
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
  email: string;
  pw: string;
  name: string;
  birth: string;
  passport: string;
  country: string;
  honorary: string;
  passportImage: string;
}
