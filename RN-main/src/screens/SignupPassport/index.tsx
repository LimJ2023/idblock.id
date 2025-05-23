import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { ScrollView, View, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {useApiPostRecogPassport} from '~/hooks/api.post.recog.passport'
import { ModalRectangleScanner } from '~/components/ModalRectangleScanner';
import { ModalPermissionGuide } from '~/components/ModalPermissionGuide';
import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { usePermissionCheck } from '~/hooks/permission.check';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const SignupPassport = memo(function ({ route }: Params) {
  const { uuid, mail, pw, name, country, honorary, birth, passport } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isVisiblePermission, setIsVisiblePermission] = useState<boolean>(false);
  const [isVisibleScanner, setIsVisibleScanner] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [editedPassportData, setEditedPassportData] = useState<any>(null);

  const { bottom } = useSafeAreaInsets();
  const { cameraPermissionCheck } = usePermissionCheck();
  const { apiPostRecogPassport } = useApiPostRecogPassport();
  const permissionRequestCount = useRef<number>(0);
  const imageRef = useRef<string>();

  if (imageRef.current !== image) {
    imageRef.current = image;
  }

  useEffect(() => {
    if (passportData) {
      setEditedPassportData(passportData);
    }
  }, [passportData]);

  const handleScanner = useCallback(async () => {
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

  const handlePassportDataChange = (field: string, value: string) => {
    setEditedPassportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScanned = useCallback(async (imagePath: string) => {
    setImage(imagePath);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${imagePath}` : imagePath,
        type: 'image/jpeg',
        name: 'passport.jpg',
      });

      const response = await apiPostRecogPassport({
        formData,
      });
      
      if (response && response.ocr_fullName) {
        setPassportData(response);
        Toast.show('여권 정보가 성공적으로 추출되었습니다', Toast.SHORT);
      } else {
        Toast.show('여권 정보 추출에 실패했습니다: ' + JSON.stringify(response), Toast.SHORT);
      }
    } catch (error) {
      console.error('Passport scanning error:', error);
      Toast.show(`이미지 처리 중 오류가 발생했습니다: ${error.message}`, Toast.SHORT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNext = useCallback(() => {
    navigation.push(MENU.STACK.SCREEN.SIGNUP_FACE, {
      uuid,
      mail,
      pw,
      name,
      country,
      honorary,
      birth,
      passport,
      passportImage: imageRef.current,
      passportData: editedPassportData || passportData,
    });
  }, [editedPassportData, passportData]);

  const openCamera = () => {
    launchCamera(
      {mediaType: 'photo'},
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          uploadImage(asset);
        }
      }
    );
  };

  const openGallery = () => {
    setIsLoading(true);
    launchImageLibrary(
      {mediaType: 'photo'},
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.log('Gallery Error: ', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          uploadImage(asset);
        }
      }
    );
    setIsLoading(false);
  };

  const uploadImage = async (asset) => {
    setImage(asset.uri)
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.type,
      name: asset.fileName || 'photo.jpg',
    });

    try {
      const response = await apiPostRecogPassport({
        formData,
      });
      setPassportData(response);
    } catch (error) {
      console.log(error);
      Toast.show('이미지 처리 중 오류가 발생했습니다', Toast.SHORT);
    }
  };

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
              ) : passportData ? (
                <>                  
                <View style={style.registeredImage}>
                <View style={style.registeredImageWrap}>
                  <Text style={[font.CAPTION1_R, style.registeredImageText]}>
                    The Passport Image is registered successfully
                  </Text>
                  <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_GREEN} style={style.registeredImageIcon} resizeMode="contain" />
                </View>
              </View>
                <View>
                  <FastImage source={{ uri: image }} style={style.passportImage} resizeMode="contain" />
                  <Text style={[font.BODY2_B, style.guideContentTitleText]}>인식된 여권의 정보를 확인해주세요</Text>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>이름:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_fullName}
                      onChangeText={(value) => handlePassportDataChange('ocr_fullName', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>성별:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_gender}
                      onChangeText={(value) => handlePassportDataChange('ocr_gender', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>생년월일:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_birthDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_birthDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>발급일:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_issueDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_issueDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>만료일:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_expireDate}
                      onChangeText={(value) => handlePassportDataChange('ocr_expireDate', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>국적:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_nationality}
                      onChangeText={(value) => handlePassportDataChange('ocr_nationality', value)}
                    />
                  </View>
                  <View style={style.inputContainer}>
                    <Text style={[font.BODY2_B, style.passportDataText]}>여권번호:</Text>
                    <TextInput
                      style={style.input}
                      value={editedPassportData?.ocr_number}
                      onChangeText={(value) => handlePassportDataChange('ocr_number', value)}
                    />
                  </View>
                </View>
                </>
              ) : image ? (
                <>
                  {/* <FastImage source={{ uri: image }} style={style.passportImage} resizeMode="contain" /> */}

                </>
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
            </View>
          </View>
          <View style={style.nextButtonWrap}>
            <Button style={style.cameraButton} onPress={handleScanner} disabled={isLoading}>
              <FastImage source={STATIC_IMAGE.CAMERA_WHITE} style={style.cameraButtonImage} resizeMode="contain" />
              <Text style={[font.BODY3_SB, style.cameraButtonText]}>Take a photo of your passport</Text>
            </Button>
            <Button
              style={[style.nextButton, { backgroundColor: passportData ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
              disabled={!passportData || isLoading}
              onPress={handleNext}>
              <Text style={[font.BODY3_SB, { color: passportData ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Next</Text>
            </Button>
          </View>
          <View style={style.passportCameraButtonWrap}>
            <Button style={[style.passportCameraButton, { backgroundColor: COLOR.PRI_1_400 }]} onPress={openGallery} >
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
  mail: string;
  pw: string;
  name: string;
  birth: string;
  passport: string;
  country: string;
  honorary: string;
}
