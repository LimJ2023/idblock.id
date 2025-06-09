import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

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

export const SignupForm = memo(function ({ route }: Params) {
  const { uuid, email, pw, ocr_fullName, ocr_gender, ocr_birthDate, ocr_nationality, ocr_number, ocr_issueDate, ocr_expireDate, passportImage } = route.params;

  // 디버깅: 전달받은 값들 확인
  // console.log('SignupForm params:', { email, pw, uuid });

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [cityList, setCityList] = useState<City[]>([
    {
      id: '1835848',
      country: 'South Korea',
      name: 'Seoul',
    },
    {
      id: '1838524',
      country: 'South Korea',
      name: 'Busan',
    }
  ]);

  const [isVisibleCountryPicker, setIsVisibleCountryPicker] = useState<boolean>(false);
  const [isVisibleCityPicker, setIsVisibleCityPicker] = useState<boolean>(false);

  const [pw2, setPw2] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [countryIndex, setCountryIndex] = useState<number>();
  const [cityIndex, setCityIndex] = useState<number>();
  const [birth, setBirth] = useState<string>('');
  const [passport, setPassport] = useState<string>('');

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
  const { bottom } = useSafeAreaInsets();

  const accessTokenRef = useRef<string>();

  if (accessTokenRef.current !== accessToken) {
    accessTokenRef.current = accessToken;
  }

  const countryListRef = useRef<Country[]>();

  if (countryListRef.current !== countryList) {
    countryListRef.current = countryList;
  }

  const cityListRef = useRef<City[]>();

  if (cityListRef.current !== cityList) {
    cityListRef.current = cityList;
  }

  const passportImageRef = useRef<string>();

  if (passportImageRef.current !== passportImage) {
    passportImageRef.current = passportImage;
  }

  const pwRef = useRef<string>();

  if (pwRef.current !== pw) {
    pwRef.current = pw;
  }

  const pw2Ref = useRef<string>();

  if (pw2Ref.current !== pw2) {
    pw2Ref.current = pw2;
  }

  const nameRef = useRef<string>();

  if (nameRef.current !== name) {
    nameRef.current = name;
  }

  const countryIndexRef = useRef<number>();

  if (countryIndexRef.current !== countryIndex) {
    countryIndexRef.current = countryIndex;
  }

  const cityIndexRef = useRef<number>();

  if (cityIndexRef.current !== cityIndex) {
    cityIndexRef.current = cityIndex;
  }

  const birthRef = useRef<string>();

  if (birthRef.current !== birth) {
    birthRef.current = birth;
  }

  const passportRef = useRef<string>();

  if (passportRef.current !== passport) {
    passportRef.current = passport;
  }

 

  const handlePw2 = useCallback((text: string) => {
    setPw2Message(undefined);
    setPw2(text);
  }, []);

  const handleName = useCallback((text: string) => {
    setNameMessage(undefined);
    setName(text);
  }, []);

  const handleCountry = useCallback(() => {
    Keyboard.dismiss();

    setIsVisibleCountryPicker(true);
  }, []);

  const handleCountryPicker = useCallback((index) => {
    setCountryMessage(undefined);
    setCountryIndex(index);
  }, []);

  const handleCity = useCallback(() => {
    Keyboard.dismiss();

    setIsVisibleCityPicker(true);
  }, []);

  const handleCityPicker = useCallback((index) => {
    setCityMessage(undefined);
    setCityIndex(index);
  }, []);

  const handleBirth = useCallback((text: string) => {
    setBirthMessage(undefined);

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

    setBirth(value);
  }, []);

  const handlePassport = useCallback((text: string) => {
    setPassportMessage(undefined);
    setPassport(text);
  }, []);

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();

    let isValid = true;

    if (!accessTokenRef.current) {

      console.log('pwRef.current : ', pwRef.current);
      console.log('birthRef : ', birthRef.current);
      console.log('passportNumber : ', passportRef.current);

      if (!pwRef.current) {
        isValid = false;

        setPwMessage({
          text: 'Please enter password.',
          color: COLOR.ERROR,
        });
      } else if (!Util.regexPassword(pwRef.current)) {
        isValid = false;

        setPwMessage({
          text: 'Password must contain 8-15 characters with the combination of letters, numbers, and special characters (!@#$%^&*()).',
          color: COLOR.ERROR,
        });
      }

      // if (!pw2Ref.current) {
      //   isValid = false;

      //   setPw2Message({
      //     text: 'Please enter password again.',
      //     color: COLOR.ERROR,
      //   });
      // }

      // if (pwRef.current && pw2Ref.current && pwRef.current !== pw2Ref.current) {
      //   isValid = false;

      //   setPw2Message({
      //     text: 'Password does not match.',
      //     color: COLOR.ERROR,
      //   });
      // }
    }

    if (!nameRef.current) {
      isValid = false;

      setNameMessage({
        text: 'Please enter your full legal name.',
        color: COLOR.ERROR,
      });
    }

    if (countryIndexRef.current === undefined) {
      isValid = false;

      setCountryMessage({
        text: 'Please select your country.',
        color: COLOR.ERROR,
      });
    }

    if (cityIndexRef.current === undefined) {
      isValid = false;

      setCityMessage({
        text: 'Please select Honorary Citizen.',
        color: COLOR.ERROR,
      });
    }

    console.log('birthRef.current : ', birthRef.current);
    if (birthRef.current?.length < 8) {
      isValid = false;

      setBirthMessage({
        text: 'Your Date of Birth does not match.',
        color: COLOR.ERROR,
      });
    }

    console.log('passportRef.current : ', passportRef.current);
    if (!passportRef.current) {
      isValid = false;

      setPassportMessage({
        text: 'Your passport number does not match with your name.',
        color: COLOR.ERROR,
      });
    }

    const verifyPassportResult = await apiPostVerifyPassport({
      birthday: birthRef.current,
      passportNumber: passportRef.current,
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
      navigation.push(nextScreen, {
        uuid,
        email,
        pw: pwRef.current,
        name: nameRef.current,
        country: countryListRef.current[countryIndexRef.current].code,
        honorary: cityListRef.current?.[cityIndexRef.current]?.id || undefined,
        birth: birthRef.current,
        passport: passportRef.current,
        passportImage: passportImageRef.current,
      });
    } else {
      console.warn('No next screen found in signup flow');
    }
  }, []);

  useEffect(() => {
    apiGetCountryList().then((list) => {
      setCountryList(list);
    });

    // apiGetCityList({
    //   code: 'KR',
    // }).then((list) => {
    //   setCityList(list);
    // });
  }, []);

  // OCR 데이터를 초기값으로 설정
  useEffect(() => {
    if (ocr_fullName) {
      setName(ocr_fullName);
    }
    if (ocr_birthDate) {
      setBirth(ocr_birthDate);
    }
    if (ocr_number) {
      setPassport(ocr_number);
    }
  }, [ocr_fullName, ocr_birthDate, ocr_number]);

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalWheelPicker
        isVisible={isVisibleCountryPicker}
        title="Country"
        initIndex={countryIndex}
        data={countryList.map((el) => el.name)}
        onClose={() => setIsVisibleCountryPicker(false)}
        onSubmit={handleCountryPicker}
      />
      <ModalWheelPicker
        isVisible={isVisibleCityPicker}
        title="Honorary"
        initIndex={cityIndex}
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
                  editable={false}
                />
                <Text style={[font.BODY2_M, style.labelText]}>Password</Text>
                <Input
                  secureTextEntry={true}
                  value={pw || ''}
                  placeholder="Enter Password"
                  wrapperStyle={style.inputWrapper}
                  message={pwMessage}
                  editable={false}
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
            <Input value={name} placeholder="Name" wrapperStyle={style.inputWrapper} message={nameMessage} onChangeText={handleName} />
            <Text style={[font.BODY2_M, style.labelText]}>Country</Text>
            <Button
              style={[style.selectButton, { borderColor: countryMessage ? COLOR.ERROR : style.selectButton.borderColor }]}
              onPress={handleCountry}>
              <Text style={[font.BODY1_R, style.selectButtonText]}>{countryList[countryIndex]?.name || 'Country'}</Text>
              <FastImage source={STATIC_IMAGE.ARROW_DOWN_BLACK} style={style.selectButtonImage} resizeMode="contain" />
            </Button>
            {countryMessage?.text && <Text style={[font.CAPTION1_M, style.messageText]}>{countryMessage.text}</Text>}
            <Text style={[font.BODY2_M, style.labelText]}>Honorary Citizen</Text>
            <Button
              style={[style.selectButton, { borderColor: cityMessage ? COLOR.ERROR : style.selectButton.borderColor }]}
              onPress={handleCity}>
              <Text style={[font.BODY1_R, style.selectButtonText]}>{cityList[cityIndex]?.name || 'Honorary Citizen'}</Text>
              <FastImage source={STATIC_IMAGE.ARROW_DOWN_BLACK} style={style.selectButtonImage} resizeMode="contain" />
            </Button>
            {cityMessage?.text && <Text style={[font.CAPTION1_M, style.messageText]}>{cityMessage.text}</Text>}
            <Text style={[font.BODY2_M, style.labelText]}>Date Of Birth</Text>
            <Input
              keyboardType="decimal-pad"
              value={birth}
              placeholder="Date of Birth (YYYYMMDD)"
              wrapperStyle={style.inputWrapper}
              message={birthMessage}
              onChangeText={handleBirth}
            />
            <Text style={[font.BODY2_M, style.labelText]}>Passport Number</Text>
            <Input
              value={passport}
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
