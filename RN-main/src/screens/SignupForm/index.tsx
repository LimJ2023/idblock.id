import React, { memo, useCallback, useEffect, useState, useRef } from 'react';

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
import { getNextScreenInFlow, SIGNUP_FLOW, AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW } from '~/utils/screenFlow';
import { useApiGetUserCountry } from '~/hooks/api.get.user.country';

export const SignupForm = memo(function ({ route }: Params) {
  const {
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
    isFromMainScreen,
    flowType,
  } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  // Zustand store에서 데이터 가져오기
  const personalData = useSignupPersonalData();
  const passportData = useSignupPassportData();
  const emailData = useSignupEmailData();
  const signupAction = useSignupAction();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(false);
  const countryListRef = useRef<Country[]>([]);
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
    signupAction.setEmail(email);
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
  }, [signupAction]);

  const handleName = useCallback((text: string) => {
    signupAction.setName(text);
  }, [signupAction]);

  const handleCountry = useCallback(() => {
    Keyboard.dismiss();

    console.log('=== handleCountry Debug ===');
    console.log('Current countryList length:', countryList.length);
    console.log('isLoadingCountries:', isLoadingCountries);

    // 이미 로딩 중이면 중복 호출 방지
    if (isLoadingCountries) {
      console.log('Already loading countries, skipping...');
      return;
    }

    // 국가 목록이 비어있으면 로드
    if (countryList.length === 0) {
      console.log('Loading country list...');
      setIsLoadingCountries(true);
              apiGetCountryList()
          .then((list) => {
            console.log('API response - Country list loaded:', list?.length, 'countries');
            console.log('Setting countryList and opening picker...');
            setCountryList(list);
            countryListRef.current = list; // ref도 업데이트
            setIsLoadingCountries(false);
            // API 응답 후 바로 picker 열기
            setIsVisibleCountryPicker(true);
          })
        .catch((error) => {
          console.warn('Failed to get country list:', error);
          setIsLoadingCountries(false);
        });
    } else {
      console.log('Country list already loaded, opening picker...');
      setIsVisibleCountryPicker(true);
    }
    console.log('===========================');
  }, [countryList, apiGetCountryList, isLoadingCountries]);

  const handleCountryPicker = useCallback((index) => {
    console.log('=== handleCountryPicker Debug ===');
    console.log('index : ', index);
    console.log('countryList (state) length : ', countryList.length);
    console.log('countryListRef (ref) length : ', countryListRef.current.length);
    console.log('countryListRef[index] : ', countryListRef.current[index]);
    console.log('================================');
    
    const currentCountryList = countryListRef.current;
    if (currentCountryList.length > 0 && currentCountryList[index]) {
      signupAction.setCountry(currentCountryList[index], index);
      signupAction.setCountryIndex(index);
    } else {
      console.warn('Country not found at index:', index, 'ref length:', currentCountryList.length);
    }
  }, [signupAction]);

  const handleCity = useCallback(() => {
    Keyboard.dismiss();

    setIsVisibleCityPicker(true);
  }, []);

  const handleCityPicker = useCallback((index) => {
    signupAction.setCity(cityList[index], index);
    signupAction.setCityIndex(index);
  }, [cityList, signupAction]);

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
  }, [signupAction]);

  const handlePassport = useCallback((text: string) => {
    signupAction.setPassportNumber(text);
  }, [signupAction]);

  const handleNext = useCallback(async () => {
    console.log('handleNext called');
    
    // 입력 유효성 검사와 모든 초기화 코드들 유지
    setPwMessage(undefined);
    setPw2Message(undefined);
    setNameMessage(undefined);
    setCountryMessage(undefined);
    setCityMessage(undefined);
    setBirthMessage(undefined);
    setPassportMessage(undefined);

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

    // 중도 가입일 때는 다른 플로우 사용
    let selectedFlow = SIGNUP_FLOW;
    
    if (isFromMainScreen && flowType === 'AFTER_SIMPLE_SIGNUP_VERIFICATION') {
      selectedFlow = AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW;
      console.log('중도 가입: AFTER_SIMPLE_SIGNUP_VERIFICATION_FLOW 사용');
    } else {
      console.log('일반 가입: SIGNUP_FLOW 사용');
    }

    const nextScreen = getNextScreenInFlow(selectedFlow, MENU.STACK.SCREEN.SIGNUP_FORM);
    if (nextScreen) {
      signupAction.goToNextStep();
      navigation.push(nextScreen, {
        // 기존 파라미터들
        uuid: route.params.uuid,
        email: emailData.email,
        pw: emailData.password,
        name: personalData.name,
        country: personalData.country?.name || '',
        honorary: personalData.city?.name || '',
        birth: personalData.birth,
        passport: personalData.passportNumber,
        // OCR 데이터
        ocr_fullName,
        ocr_gender,
        ocr_birthDate,
        ocr_nationality,
        ocr_number,
        ocr_issueDate,
        ocr_expireDate,
        passportImage,
        // 중도 가입 플래그들
        isFromMainScreen,
        flowType,
      });
    } else {
      // 플로우 마지막이면 메인 화면이나 결과 화면으로
      if (isFromMainScreen) {
        console.log('중도 가입 완료: 메인 화면으로 이동');
        navigation.popToTop(); // 메인 화면으로 돌아가기
      } else {
        console.warn('No next screen found in signup flow');
      }
    }
  }, [accessToken, emailData, personalData, apiPostVerifyPassport, signupAction, navigation, isFromMainScreen, flowType, route.params]);

  // countryList가 변경될 때마다 ref 동기화
  useEffect(() => {
    countryListRef.current = countryList;
  }, [countryList]);

  // OCR 국가 정보 처리
  useEffect(() => {
    if (ocr_nationality && countryList.length > 0) {
      apiGetUserCountry({ code3: ocr_nationality })
        .then((country) => {
          if (country) {
            // 국가 목록에서 해당 국가의 인덱스 찾아서 설정
            const foundIndex = countryList.findIndex((c) => c.code3 === ocr_nationality);
            if (foundIndex !== -1) {
              signupAction.setCountry(country, foundIndex);
              signupAction.setCountryIndex(foundIndex);
            } else {
              // 인덱스를 찾지 못한 경우에도 국가 데이터는 설정
              signupAction.setCountry(country);
            }
          }
        })
        .catch((error) => {
          console.warn('Failed to get user country:', error);
        });
    }
  }, [ocr_nationality, countryList, signupAction]);

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

  // ModalWheelPicker 렌더링 시 데이터 확인
  const countryPickerData = countryList.map((el) => el.name);
  
  React.useEffect(() => {
    if (isVisibleCountryPicker) {
      console.log('=== ModalWheelPicker Render Debug ===');
      console.log('countryList length:', countryList.length);
      console.log('countryPickerData length:', countryPickerData.length);
      console.log('countryPickerData:', countryPickerData);
      console.log('====================================');
    }
  }, [isVisibleCountryPicker, countryList, countryPickerData]);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalWheelPicker
        isVisible={isVisibleCountryPicker}
        title="Country"
        initIndex={personalData.countryIndex}
        data={countryPickerData}
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
  isFromMainScreen?: boolean;
  flowType?: string;
}
