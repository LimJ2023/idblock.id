import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Keyboard, Platform, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from '@d11/react-native-fast-image';
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

export const SignupForm = memo(function ({ route }: Params) {
  const { uuid, mail } = route.params;

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
    },
    {
      id: '1835329',
      country: 'South Korea',
      name: 'Daegu',
    },
    {
      id: '1843564',
      country: 'South Korea',
      name: 'Incheon',
    },
    {
      id: '1841810',
      country: 'South Korea',
      name: 'Gwangju',
    },
    {
      id: '1835235',
      country: 'South Korea',
      name: 'Daejeon',
    },
    {
      id: '1835235',
      country: 'South Korea',
      name: 'Daejeon',
    },
    {
      id: '1841988',
      country: 'South Korea',
      name: 'Gyeonggi',
    },
    {
      id: '1844174',
      country: 'South Korea',
      name: 'Gangwon',
    },
    {
      id: '1840211',
      country: 'South Korea',
      name: 'Chungnam',
    },
    {
      id: '1845033',
      country: 'South Korea',
      name: 'Chungbuk',
    },
    {
      id: '1840536',
      country: 'South Korea',
      name: 'Jeonnam',
    },
    {
      id: '1842939',
      country: 'South Korea',
      name: 'Jeonbuk',
    },
    {
      id: '1832828',
      country: 'South Korea',
      name: 'Gyeongnam',
    },
    {
      id: '1841598',
      country: 'South Korea',
      name: 'Gyeongbuk',
    },
    {
      id: '1846266',
      country: 'South Korea',
      name: 'Jeju City',
    },
  ]);

  const [isVisibleCountryPicker, setIsVisibleCountryPicker] = useState<boolean>(false);
  const [isVisibleCityPicker, setIsVisibleCityPicker] = useState<boolean>(false);

  const [pw, setPw] = useState<string>('');
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

  const handlePw = useCallback((text: string) => {
    setPwMessage(undefined);
    setPw(text);
  }, []);

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

      if (!pw2Ref.current) {
        isValid = false;

        setPw2Message({
          text: 'Please enter password again.',
          color: COLOR.ERROR,
        });
      }

      if (pwRef.current && pw2Ref.current && pwRef.current !== pw2Ref.current) {
        isValid = false;

        setPw2Message({
          text: 'Password does not match.',
          color: COLOR.ERROR,
        });
      }
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

    if (birthRef.current?.length !== 8) {
      isValid = false;

      setBirthMessage({
        text: 'Your Date of Birth does not match.',
        color: COLOR.ERROR,
      });
    }

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

    if (!verifyPassportResult) {
      isValid = false;

      setPassportMessage({
        text: 'The passport is already registered.',
        color: COLOR.ERROR,
      });
    }

    if (!isValid) {
      return;
    }

    navigation.push(MENU.STACK.SCREEN.SIGNUP_PASSPORT, {
      uuid,
      mail,
      pw: pwRef.current,
      name: nameRef.current,
      country: countryListRef.current[countryIndexRef.current].code,
      honorary: cityListRef.current?.[cityIndexRef.current]?.id || undefined,
      birth: birthRef.current,
      passport: passportRef.current,
    });
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
                  value={mail}
                  placeholder="Email Address"
                  wrapperStyle={style.inputWrapper}
                  containerStyle={style.inputDisabledContainer}
                  style={style.inputDisabledText}
                  disabled={true}
                />
                <Text style={[font.BODY2_M, style.labelText]}>Password</Text>
                <Input
                  secureTextEntry={true}
                  value={pw}
                  placeholder="Enter Password"
                  wrapperStyle={style.inputWrapper}
                  message={pwMessage}
                  onChangeText={handlePw}
                />
                <Text style={[font.BODY2_M, style.labelText]}>Enter Password Again</Text>
                <Input
                  secureTextEntry={true}
                  value={pw2}
                  placeholder="Enter Password Again"
                  wrapperStyle={style.inputWrapper}
                  message={pw2Message}
                  onChangeText={handlePw2}
                />
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
  route: Route<string, NavigationParams>;
}

interface NavigationParams {
  uuid?: string;
  mail?: string;
}
