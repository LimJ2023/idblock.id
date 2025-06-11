import React, { memo, useCallback, useRef, useState } from 'react';

import { ScrollView, View, Image } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import { launchImageLibrary } from 'react-native-image-picker';

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
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

export const SignupFace = memo(function ({ route }: Params) {
  const { uuid, email, pw, name, country, honorary, birth, passport, passportImage } = route.params;

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
          }
        );
  }, []);

  const handleMockImage = useCallback(() => {
    // 개발 환경에서 사용할 더미 이미지 URL
    const mockImageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face';
    setImage(mockImageUrl);
    Toast.show('Mock image set for testing', Toast.SHORT);
  }, []);

  const handleNext = useCallback(async () => {
    try {
      console.log('=== handleNext 시작 ===');
      setIsVisibleLoading(true);

      console.log('passportImage:', passportImage);
      console.log('imageRef.current:', imageRef.current);

      // 필수 데이터 검증
      if (!passportImage) {
        console.log('passportImage가 없습니다');
        Toast.show('Passport image is required', Toast.SHORT);
        return;
      }

      if (!imageRef.current) {
        console.log('face image가 없습니다');
        Toast.show('Face image is required', Toast.SHORT);
        return;
      }

      console.log('=== 여권 이미지 업로드 시작 ===');
      console.log('여권 이미지 업로드 직전 - 메모리 체크');
      let passportUploadResult: any;
      try {
        passportUploadResult = await apiPostAuthPassport({
          formData: Util.getFileAppendedFormData(passportImage),
        });
        console.log('여권 이미지 업로드 완료:', passportUploadResult);
      } catch (error) {
        console.log('여권 업로드 에러:', error);
        if (error?.code === 'ECONNABORTED') {
          Toast.show('여권 이미지 업로드 시간이 초과되었습니다. 다시 시도해주세요.', Toast.SHORT);
        } else if (error?.code === 'ERR_NETWORK') {
          Toast.show('네트워크 연결을 확인해주세요.', Toast.SHORT);
        } else {
          Toast.show('여권 이미지 업로드에 실패했습니다. 다시 시도해주세요.', Toast.SHORT);
        }
        return;
      }

      console.log('=== 얼굴 이미지 업로드 시작 ===');
      console.log('얼굴 이미지 업로드 직전 - 메모리 체크');
      let faceUploadResult: any;
      try {
        faceUploadResult = await apiPostAuthFace({
          formData: Util.getFileAppendedFormData(imageRef.current),
        });
        console.log('얼굴 이미지 업로드 완료:', faceUploadResult);
      } catch (error) {
        console.log('얼굴 업로드 에러:', error);
        if (error?.code === 'ECONNABORTED') {
          Toast.show('얼굴 이미지 업로드 시간이 초과되었습니다. 다시 시도해주세요.', Toast.SHORT);
        } else if (error?.code === 'ERR_NETWORK') {
          Toast.show('네트워크 연결을 확인해주세요.', Toast.SHORT);
        } else {
          Toast.show('얼굴 이미지 업로드에 실패했습니다. 다시 시도해주세요.', Toast.SHORT);
        }
        return;
      }

      console.log('=== 업로드 결과 검증 ===');
      console.log('passportUploadResult?.key:', passportUploadResult?.key);
      console.log('faceUploadResult?.key:', faceUploadResult?.key);

      if (passportUploadResult?.key && faceUploadResult?.key) {
        console.log('파일 업로드 성공, 회원가입/정보수정 진행');
        let isSuccessSignup = false;

        console.log('=== 회원가입/정보수정 API 호출 시작 ===');
        console.log('accessTokenRef.current:', accessTokenRef.current);
        try {
          if (accessTokenRef.current) {
            console.log('기존 사용자 정보 수정 진행');
            console.log('apiPutAuthInformation 호출 직전');
            isSuccessSignup = await apiPutAuthInformation({
              name,
              birthday: birth,
              countryCode: country,
              cityId: honorary,
              passportNumber: passport,
              passportImageKey: passportUploadResult.key,
              profileImageKey: faceUploadResult.key,
            });
            console.log('apiPutAuthInformation 호출 완료, 결과:', isSuccessSignup);
          } else {
            console.log('apiPostAuthSignup 호출 직전');
                isSuccessSignup = await apiPostAuthSignup({
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
                console.log(`회원가입 시도 완료, 결과:`, isSuccessSignup);
          }
        } catch (error) {
          console.log('회원가입/정보수정 API 에러:', error);
          console.error('API 에러 스택:', error?.stack);
          if (error?.code === 'ECONNABORTED') {
            Toast.show('요청 시간이 초과되었습니다. 다시 시도해주세요.', Toast.SHORT);
          } else if (error?.code === 'ERR_NETWORK') {
            Toast.show('네트워크 연결을 확인해주세요. 서버에 접속할 수 없습니다.', Toast.SHORT);
          } else {
            Toast.show('서버 처리 중 오류가 발생했습니다. 다시 시도해주세요.', Toast.SHORT);
          }
          return;
        }

        console.log('=== 네비게이션 처리 시작 ===');
        console.log('최종 isSuccessSignup:', isSuccessSignup);
        if (isSuccessSignup) {
          console.log('네비게이션 처리 시작');
          try {
            const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_FACE);
            console.log('nextScreen 계산 완료:', nextScreen);
            
            if (nextScreen) {
              console.log('다음 화면으로 이동:', nextScreen);
              navigation.push(nextScreen);
              console.log('navigation.push 완료');
            } else {
              console.log('플로우 마지막 - 메인으로 이동');
              navigation.reset({
                index: 0,
                routes: [{ name: MENU.STACK.SCREEN.MAIN }],
              });
              console.log('navigation.reset 완료');
            }
          } catch (navError) {
            console.error('네비게이션 에러:', navError);
            console.error('네비게이션 에러 스택:', navError?.stack);
            Toast.show('화면 이동 중 오류가 발생했습니다.', Toast.SHORT);
          }
        } else {
          console.log('회원가입/정보수정 실패');
          Toast.show('Registration failed. Please try again.', Toast.SHORT);
        }
      } else {
        console.log('파일 업로드 실패');
        console.log('passportUploadResult:', passportUploadResult);
        console.log('faceUploadResult:', faceUploadResult);
        Toast.show('File upload failed. Please try again.', Toast.SHORT);
      }
    } catch (error) {
      console.log('handleNext 전체 에러:', error);
      console.error('handleNext 에러 스택:', error?.stack);
      if (error?.code === 'ECONNABORTED') {
        Toast.show('요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.', Toast.SHORT);
      } else if (error?.code === 'ERR_NETWORK') {
        Toast.show('네트워크 연결 오류입니다. 인터넷 연결을 확인해주세요.', Toast.SHORT);
      } else {
        Toast.show('An error occurred. Please try again.', Toast.SHORT);
      }
    } finally {
      console.log('=== handleNext 완료, 로딩 해제 ===');
      setIsVisibleLoading(false);
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
            {/* {__DEV__ && (
              <Button style={[style.cameraButton, { marginTop: 10, backgroundColor: COLOR.PRI_2_500 }]} onPress={handleMockImage}>
                <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
                <Text style={[font.BODY3_SB, style.cameraButtonText]}>Set Mock Image (Dev)</Text>
              </Button>
            )} */}

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
