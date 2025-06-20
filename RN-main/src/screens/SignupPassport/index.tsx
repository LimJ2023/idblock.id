import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { ScrollView, TextInput, View, ActivityIndicator } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';

import { ModalRectangleScanner } from '~/components/ModalRectangleScanner';
import { ModalPermissionGuide } from '~/components/ModalPermissionGuide';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { usePermissionCheck } from '~/hooks/permission.check';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import { launchImageLibrary, Asset, ImageLibraryOptions } from 'react-native-image-picker';

import style from './style';
import { useApiPostRecogPassport } from '~/hooks/api.post.recog.passport';
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

export const SignupPassport = memo(function ({ route }: Params) {
  const { uuid, email, pw, name, country, honorary, birth, passport } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();
  const { apiPostRecogPassport } = useApiPostRecogPassport();
  const [isVisiblePermission, setIsVisiblePermission] = useState<boolean>(false);
  const [isVisibleScanner, setIsVisibleScanner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');
  const [passportData, setPassportData] = useState<any>({});
  const { bottom } = useSafeAreaInsets();
  const { cameraPermissionCheck } = usePermissionCheck();

  const permissionRequestCount = useRef<number>(0);

  const imageRef = useRef<string>();

  if (imageRef.current !== image) {
    imageRef.current = image;
  }

  const handleScanner = useCallback(() => {
    cameraPermissionCheck().then((result) => {
      if (result === 'granted') {
        setIsVisibleScanner(true);
      } else if (permissionRequestCount.current === 0) {
        permissionRequestCount.current = permissionRequestCount.current + 1;

        Toast.show('Permission to use camera has been denied.', Toast.SHORT);
      } else {
        setIsVisiblePermission(true);
      }
    });
  }, []);

  const handleScanned = useCallback((imagePath: string) => {
    setImage(imagePath);
  }, []);

  const handleNext = useCallback(() => {
    // 동적으로 다음 화면 결정
    const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_PASSPORT);

    if (nextScreen) {
      navigation.push(nextScreen, {
        uuid,
        email,
        pw,
        name,
        country,
        honorary,
        birth,
        passport,
        passportImage: imageRef.current,
        // OCR로 처리된 여권 데이터 전달
        ocr_fullName: passportData?.ocr_fullName,
        ocr_gender: passportData?.ocr_gender,
        ocr_birthDate: passportData?.ocr_birthDate,
        ocr_nationality: passportData?.ocr_nationality,
        ocr_number: passportData?.ocr_number,
        ocr_issueDate: passportData?.ocr_issueDate,
        ocr_expireDate: passportData?.ocr_expireDate,
      });
    } else {
      // 플로우 마지막이면 메인 화면이나 결과 화면으로
      console.warn('No next screen found in signup flow');
    }
  }, [uuid, email, pw, name, country, honorary, birth, passport, passportData]);

  const openGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('사용자가 갤러리를 취소했습니다.');
        return;
      }

      if (response.errorCode) {
        console.log('Gallery Error: ', response.errorMessage);
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (asset?.uri) {
        console.log('선택된 이미지 URI:', asset.uri);
        setImage(asset.uri);
      } else {
        console.warn('이미지 자산을 찾을 수 없습니다.');
      }
    });
  };

  const handlePostRecogPassport = useCallback(async () => {
    if (image) {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'passport.jpg',
        type: 'image/jpeg',
      });
      setIsLoading(true);
      const response = await apiPostRecogPassport({ formData });

      if (!response.ocr_fullName && !response.ocr_birthDate && !response.ocr_issueDate && !response.ocr_expireDate) {
        Toast.show('Please select a passport image', Toast.SHORT);
      } else {
        setPassportData(response);
      }
      setIsLoading(false);
    } else {
      Toast.show('Please select a passport image', Toast.SHORT);
    }
  }, [image]);

  const handlePassportDataChange = useCallback(
    (key: string, value: string) => {
      setPassportData({ ...passportData, [key]: value });
    },
    [passportData],
  );

  useEffect(() => {
    handlePostRecogPassport();
  }, [image]);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalPermissionGuide
        isVisible={isVisiblePermission}
        text={`"CrossHub" has been denied access to Camera. You can enable permissions in`}
        onClose={() => setIsVisiblePermission(false)}
      />
      <ModalRectangleScanner isVisible={isVisibleScanner} onSubmit={handleScanned} onClose={() => setIsVisibleScanner(false)} />
      <Header title="Passport Verification" />
      <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={style.body}>
          <View style={style.bodyContent}>
            <View style={style.guideWrap}>
              {isLoading ? (
                <View style={style.loadingContainer}>
                  <ActivityIndicator size="large" color={COLOR.PRI_1_500} />
                  <Text style={[font.BODY3_R, style.loadingText]}>Processing passport image...</Text>
                </View>
              ) : (
                <></>
              )}
              {image ? (
                <FastImage source={{ uri: image }} style={style.passportImage} resizeMode="contain" />
              ) : (
                <FastImage source={STATIC_IMAGE.PASSPORT_SAMPLE} style={style.passportSampleImage} resizeMode="contain" />
              )}
              {image ? (
                <View style={style.registeredImage}>
                  <View style={style.registeredImageWrap}>
                    <Text style={[font.CAPTION1_R, style.registeredImageText]}>The Passport Image is registered succesfully</Text>
                    <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_GREEN} style={style.registeredImageIcon} resizeMode="contain" />
                  </View>
                </View>
              ) : (
                <View style={style.guideContentWrap}>
                  <Text style={[font.BODY2_B, style.guideContentTitleText]}>Guidelines for taking a passport photo</Text>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>
                      The passport image must be clear and sharp, with text easily readable.
                    </Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>
                      Ensure that there are no light reflections, shadows, or cropped edges.
                    </Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>Verify that the passport is still valid.</Text>
                  </View>
                  <View style={style.guideContentTextWrap}>
                    <Text style={[font.BODY4_R, style.guideContentHead]}>·</Text>
                    <Text style={[font.INPUT2, style.guideContentText]}>
                      Your name, passport number, country, and nationality must match the passport details.
                    </Text>
                  </View>
                </View>
              )}
              {passportData.ocr_fullName ? (
                <View>
                  <Text style={[font.BODY2_B, style.guideContentTitleText]}>인식된 여권의 정보를 확인해주세요</Text>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>이름:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_fullName}
                      onChangeText={(value) => handlePassportDataChange('ocr_fullName', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>성별:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_gender}
                      onChangeText={(value) => handlePassportDataChange('ocr_gender', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>생년월일:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_birthDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_birthDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>발급일:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_issueDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_issueDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>만료일:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_expireDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_expireDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>국적:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_nationality}
                      onChangeText={(value) => handlePassportDataChange('ocr_nationality', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>여권번호:</Text>
                    <TextInput
                      style={style.input}
                      value={passportData?.ocr_number}
                      onChangeText={(value) => handlePassportDataChange('ocr_number', value)}
                    />
                  </View>
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View style={style.nextButtonWrap}>
            <Button style={style.cameraButton} onPress={handleScanner}>
              <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
              <Text style={[font.BODY3_SB, style.cameraButtonText]}>Take a photo of your passport</Text>
            </Button>
            <Button
              style={[style.nextButton, { backgroundColor: image && !isLoading ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
              disabled={!image && isLoading}
              onPress={handleNext}>
              <Text style={[font.BODY3_SB, { color: image && !isLoading ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Next</Text>
            </Button>
          </View>
          <View style={style.passportCameraButtonWrap}>
            <Button style={[style.passportCameraButton, { backgroundColor: COLOR.PRI_1_400 }]} onPress={openGallery}>
              <Text style={[font.BODY3_SB, { color: COLOR.WHITE }]}>Select from Gallery</Text>
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
}
