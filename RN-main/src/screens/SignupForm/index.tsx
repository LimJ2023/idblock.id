import React, { memo, useCallback, useEffect, useState } from 'react';

import { Keyboard, Platform, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';
import dayjs from 'dayjs';

import { ModalWheelPicker } from '~/components/ModalWheelPicker';
import { Input, InputMessage } from '~/components/Input';
import { Button } from '~/components/Button';
import { Header } from '~/components/Header';
import { Text } from '~/components/Text';

import { useAccessToken } from '~/zustands/app';
import { 
  useSignupPersonalData,
  useSignupPassportData, 
  useSignupAction, 
  useSignupEmailData,
  SignupStep
} from '~/zustands/signup';

import { useApiPostVerifyPassport } from '~/hooks/api.post.verify.passport';
import { useApiGetCountryList } from '~/hooks/api.get.country.list';
import { useApiGetCityList } from '~/hooks/api.get.city.list';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { Country } from '~/types/country';
import { COLOR } from '~/utils/guide';
import { City } from '~/types/city';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';
import { useApiGetUserCountry } from '~/hooks/api.get.user.country';

export const SignupForm = memo(function ({ route }: Params) {
  const {
    uuid,
    email,
    pw,
    ocr_fullName,
    ocr_gender,
    ocr_birthDate,
    ocr_nationality,
    ocr_number,
    ocr_issueDate,
    ocr_expireDate,
    passportImage,
  } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  // Zustand store에서 데이터 가져오기
  const personalData = useSignupPersonalData();
  const passportData = useSignupPassportData();
  const emailData = useSignupEmailData();
  const signupAction = useSignupAction();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [cityList, setCityList] = useState<City[]>([
    { id: '1835848', country: 'South Korea', name: 'Seoul' },
    { id: '1838524', country: 'South Korea', name: 'Busan' }, // 부산
    { id: '1835329', country: 'South Korea', name: 'Daegu' }, // 대구
    { id: '1843564', country: 'South Korea', name: 'Incheon' }, // 인천
    { id: '1835235', country: 'South Korea', name: 'Daejeon' }, // 대전
    { id: '1841810', country: 'South Korea', name: 'Gwangju' }, // 광주
    { id: '1833747', country: 'South Korea', name: 'Ulsan' }, // 울산
    { id: '1841610', country: 'South Korea', name: 'Gyeonggi' }, // 경기
    { id: '4681948', country: 'South Korea', name: 'Gangwon' }, // 광원
    { id: '1845105', country: 'South Korea', name: 'Chungnam' }, // 충남
    { id: '1845106', country: 'South Korea', name: 'Chungbuk' }, // 충북
    { id: '1845788', country: 'South Korea', name: 'Jeonnam' }, // 전남
    { id: '1845789', country: 'South Korea', name: 'Jeonbuk' }, // 전북
    { id: '1902028', country: 'South Korea', name: 'Gyeongnam' }, // 경남
    { id: '1841597', country: 'South Korea', name: 'Gyeongbuk' }, // 경북
    { id: '1846266', country: 'South Korea', name: 'Jeju City' }, // 제주시
  ]);

  const [isVisibleCountryPicker, setIsVisibleCountryPicker] = useState<boolean>(false);
  const [isVisibleCityPicker, setIsVisibleCityPicker] = useState<boolean>(false);

  const [pwMessage, setPwMessage] = useState<InputMessage>();
  const [pw2Message, setPw2Message] = useState<InputMessage>();
  const [nameMessage, setNameMessage] = useState<InputMessage>();
  const [countryMessage, setCountryMessage] = useState<InputMessage>();
  const [cityMessage, setCityMessage] = useState<InputMessage>();
  const [birthMessage, setBirthMessage] = useState<InputMessage>();
  const [passportMessage, setPassportMessage] = useState<InputMessage>();
  
  const { accessToken } = useAccessToken();

  const { apiPostVerifyPassport } = useApiPostVerifyPassport();
  const { apiGetCountryList } = useApiGetCountryList();
  const { apiGetCityList } = useApiGetCityList();
  const { apiGetUserCountry } = useApiGetUserCountry();

  const { bottom } = useSafeAreaInsets();

  // 컴포넌트 마운트 시 현재 단계 설정 및 OCR 데이터 설정
  useEffect(() => {
    signupAction.setCurrentStep(SignupStep.FORM);
    
    // OCR 데이터가 있으면 설정
    if (ocr_fullName) signupAction.setName(ocr_fullName);
    if (ocr_birthDate) signupAction.setBirth(ocr_birthDate);
    if (ocr_number) signupAction.setPassportNumber(ocr_number);
    
    // 여권 OCR 데이터 저장
    signupAction.setOcrData({
      ocr_fullName,
      ocr_gender,
      ocr_birthDate,
      ocr_nationality,
      ocr_number,
      ocr_issueDate,
      ocr_expireDate,
    });
    
    // 여권 이미지 저장
    if (passportImage) {
      signupAction.setPassportImage(passportImage);
    }
  }, [signupAction, ocr_fullName, ocr_gender, ocr_birthDate, ocr_nationality, ocr_number, ocr_issueDate, ocr_expireDate, passportImage]);

  // Refs는 Zustand store로 대체되었으므로 제거

  const handlePw2 = useCallback((text: string) => {
    signupAction.setPasswordConfirm(text);
  }, []);

  const handleName = useCallback((text: string) => {
    signupAction.setName(text);
  }, []);

  const handleCountry = useCallback(() => {
    Keyboard.dismiss();

    setIsVisibleCountryPicker(true);
  }, []);

  const handleCountryPicker = useCallback((index) => {
    signupAction.setCountry(countryList[index]);
  }, []);

  const handleCity = useCallback(() => {
    Keyboard.dismiss();

    setIsVisibleCityPicker(true);
  }, []);

  const handleCityPicker = useCallback((index) => {
    signupAction.setCity(cityList[index]);
    signupAction.setCityIndex(index);
  }, []);

  const handleBirth = useCallback((text: string) => {
    

    const value = text.trim().replace(/\./g, '');

    if (value.length > 8) {
      return;
    }

    const year = Number(value.substring(0, 4));
    const month = Number(value.substring(4, 6));
    const date = Number(value.substring(6));

    if (year && month && date) {
      const result = dayjs(new Date(year, month - 1, date)).format('YYYYMMDD');

      if (value.length === 8 && value !== result) {
        return;
      }
    }

    if (value.substring(4, 6) === '00' || month > 12) {
      return;
    }

    if (value.substring(6) === '00' || date > 31) {
      return;
    }

    if (value.length === 8) {
      Keyboard.dismiss();
    }
    signupAction.setBirth(text);
  }, []);

  const handlePassport = useCallback((text: string) => {
    signupAction.setPassportNumber(text);
  }, []);

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();

    let isValid = true;

    if (!accessToken) {

      if (!emailData.password) {
        isValid = false;

        setPwMessage({
          text: 'Please enter password.',
          color: COLOR.ERROR,
        });
      } else if (!Util.regexPassword(emailData.password)) {
        isValid = false;

        setPwMessage({
          text: 'Password must contain 8-15 characters with the combination of letters, numbers, and special characters (!@#$%^&*()).',
          color: COLOR.ERROR,
        });
      }
    }

    if (!personalData.name) {
      isValid = false;

      setNameMessage({
        text: 'Please enter your full legal name.',
        color: COLOR.ERROR,
      });
    }

    if (!personalData.country) {
      isValid = false;

      setCountryMessage({
        text: 'Please select your country.',
        color: COLOR.ERROR,
      });
    }

    if (!personalData.city) {
      isValid = false;

      setCityMessage({
        text: 'Please select Honorary Citizen.',
        color: COLOR.ERROR,
      });
    }

    if (personalData.birth?.length < 8) {
      isValid = false;

      setBirthMessage({
        text: 'Your Date of Birth does not match.',
        color: COLOR.ERROR,
      });
    }

    if (!personalData.passportNumber) {
      isValid = false;

      setPassportMessage({
        text: 'Your passport number does not match with your name.',
        color: COLOR.ERROR,
      });
    }

    const verifyPassportResult = await apiPostVerifyPassport({
      email: emailData.email,
      birthday: personalData.birth,
      passportNumber: personalData.passportNumber,
    });
    console.log('verifyPassportResult : ', verifyPassportResult);
    if (!verifyPassportResult) {
      isValid = false;

      setPassportMessage({
        text: 'The passport is already registered.',
        color: COLOR.ERROR,
      });
    }

    console.log('isValid : ', isValid);

    if (!isValid) {
      return;
    }

    const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_FORM);
    if (nextScreen) {
      signupAction.goToNextStep();
      navigation.push(nextScreen);
    } else {
      console.warn('No next screen found in signup flow');
    }
  }, []);

  useEffect(() => {
    // 국가 목록 가져오기
    apiGetCountryList()
      .then((list) => {
        setCountryList(list);

        // OCR 국가 정보가 있고, 국가 목록이 로드된 후에 처리
        if (ocr_nationality && list.length > 0) {
          apiGetUserCountry({ code3: ocr_nationality })
            .then((country) => {
              if (country) {
                signupAction.setCountry(country);
                // 국가 목록에서 해당 국가의 인덱스 찾아서 설정
                const foundIndex = list.findIndex((c) => c.code3 === ocr_nationality);
                if (foundIndex !== -1) {
                  signupAction.setCountry(country, foundIndex);
                }
              }
            })
            .catch((error) => {
              console.warn('Failed to get user country:', error);
            });
        }
      })
      .catch((error) => {
        console.warn('Failed to get country list:', error);
      });
  }, [ocr_nationality]);

  // OCR 데이터를 초기값으로 설정
  useEffect(() => {
    if (ocr_fullName) {
      signupAction.setName(ocr_fullName);
    }
    if (ocr_birthDate) {
      signupAction.setBirth(ocr_birthDate);
    }
    if (ocr_number) {
      signupAction.setPassportNumber(ocr_number);
    }
  }, [ocr_fullName, ocr_birthDate, ocr_number]);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalWheelPicker
        isVisible={isVisibleCountryPicker}
        title="Country"
        initIndex={personalData.countryIndex}
        data={countryList.map((el) => el.name)}
        onClose={() => setIsVisibleCountryPicker(false)}
        onSubmit={handleCountryPicker}
      />
      <ModalWheelPicker
        isVisible={isVisibleCityPicker}
        title="Honorary"
        initIndex={personalData.cityIndex}
        data={cityList.map((el) => el.name)}
        onClose={() => setIsVisibleCityPicker(false)}
        onSubmit={handleCityPicker}
      />
      <Header title="Sign Up" />
      <KeyboardAwareScrollView
        contentContainerStyle={style.body}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.select({
          android: 180,
          ios: 180,
        })}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={Number.MAX_SAFE_INTEGER}
        enableOnAndroid={true}>
        <View style={style.bodyContent}>
          <View style={style.formWrap}>
            {!accessToken && (
              <>
                <Text style={[font.BODY2_M, style.labelText]}>Email</Text>
                <Input
                  keyboardType="email-address"
                  value={email || ''}
                  placeholder="Email Address"
                  wrapperStyle={style.inputWrapper}
                  containerStyle={style.inputDisabledContainer}
                  style={style.inputDisabledText}
                  disabled={true}
                />
                <Text style={[font.BODY2_M, style.labelText]}>Password</Text>
                <Input
                  secureTextEntry={true}
                  value={pw || ''}
                  placeholder="Enter Password"
                  wrapperStyle={style.inputWrapper}
                  message={pwMessage}
                  containerStyle={style.inputDisabledContainer}
                  style={style.inputDisabledText}
                  disabled={true}
                />
                {/* <Text style={[font.BODY2_M, style.labelText]}>Enter Password Again</Text> */}
                {/* <Input
                  secureTextEntry={true}
                  value={pw2}
                  placeholder="Enter Password Again"
                  wrapperStyle={style.inputWrapper}
                  message={pw2Message}
                  onChangeText={handlePw2}
                /> */}
              </>
            )}
            <Text style={[font.BODY2_M, style.labelText]}>Name</Text>
            <Input value={personalData.name} placeholder="Name" wrapperStyle={style.inputWrapper} message={nameMessage} onChangeText={handleName} />
            <Text style={[font.BODY2_M, style.labelText]}>Country</Text>
            <Button
              style={[style.selectButton, { borderColor: countryMessage ? COLOR.ERROR : style.selectButton.borderColor }]}
              onPress={handleCountry}>
              <Text style={[font.BODY1_R, style.selectButtonText]}>
                {personalData.countryIndex !== undefined ? countryList[personalData.countryIndex]?.name : personalData.country?.name || 'Country'}
              </Text>
              <FastImage source={STATIC_IMAGE.ARROW_DOWN_BLACK} style={style.selectButtonImage} resizeMode="contain" />
            </Button>
            {countryMessage?.text && <Text style={[font.CAPTION1_M, style.messageText]}>{countryMessage.text}</Text>}
            <Text style={[font.BODY2_M, style.labelText]}>Honorary Citizen</Text>
            <Button
              style={[style.selectButton, { borderColor: cityMessage ? COLOR.ERROR : style.selectButton.borderColor }]}
              onPress={handleCity}>
              <Text style={[font.BODY1_R, style.selectButtonText]}>{cityList[personalData.cityIndex]?.name || 'Honorary Citizen'}</Text>
              <FastImage source={STATIC_IMAGE.ARROW_DOWN_BLACK} style={style.selectButtonImage} resizeMode="contain" />
            </Button>
            {cityMessage?.text && <Text style={[font.CAPTION1_M, style.messageText]}>{cityMessage.text}</Text>}
            <Text style={[font.BODY2_M, style.labelText]}>Date Of Birth</Text>
            <Input
              keyboardType="decimal-pad"
              value={personalData.birth}
              placeholder="Date of Birth (YYYYMMDD)"
              wrapperStyle={style.inputWrapper}
              message={birthMessage}
              onChangeText={handleBirth}
            />
            <Text style={[font.BODY2_M, style.labelText]}>Passport Number</Text>
            <Input
              value={personalData.passportNumber}
              placeholder="Passport Number"
              wrapperStyle={style.inputWrapper}
              message={passportMessage}
              onChangeText={handlePassport}
            />
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button style={[style.nextButton, { backgroundColor: COLOR.PRI_1_500 }]} onPress={handleNext}>
            <Text style={[font.BODY3_SB, style.nextButtonText]}>Verification Confirmation</Text>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
});

interface Params {
  route: {
    params: NavigationParams;
  };
}

interface NavigationParams {
  uuid?: string;
  email?: string;
  pw?: string;
  name?: string;
  country?: string;
  honorary?: string;
  birth?: string;
  passport?: string;
  ocr_fullName?: string;
  ocr_gender?: string;
  ocr_birthDate?: string;
  ocr_nationality?: string;
  ocr_number?: string;
  ocr_issueDate?: string;
  ocr_expireDate?: string;
  passportImage?: string;
}
