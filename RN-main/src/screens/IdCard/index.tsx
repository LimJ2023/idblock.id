import React, { memo, useCallback, useEffect, useState } from 'react';

import { ImageBackground, ScrollView, View, Vibration } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Shadow } from 'react-native-shadow-2';
import FastImage from 'react-native-fast-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  runOnJS, 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useAppRootAction } from '~/zustands/app';
import { useProfile } from '~/zustands/user';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';
import { Flag } from '~/components/Flag';

export const IdCard = memo(function () {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const { setSafeAreaColor } = useAppRootAction();
  const { profile } = useProfile();

  const { bottom } = useSafeAreaInsets();

  const [bgSource, setBgSource] = useState(null);
  const [countryCode, setCountryCode] = useState(null);

  // 애니메이션 값
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const cityBackgrounds = {
    kr: {
      seoul: require('~/assets/images/id-bg-kr-seoul.png'),
      busan: require('~/assets/images/id-bg-kr-busan.png'),
      daegu: require('~/assets/images/id-bg-kr-daegu.png'),
      incheon: require('~/assets/images/id-bg-kr-incheon.png'),
      gwangju: require('~/assets/images/id-bg-kr-gwangju.png'),
      daejeon: require('~/assets/images/id-bg-kr-daejeon.png'),
      gyeonggi: require('~/assets/images/id-bg-kr-gyeonggi.png'),
      gangwon: require('~/assets/images/id-bg-kr-gangwon.png'),
      chungnam: require('~/assets/images/id-bg-kr-chungnam.png'),
      chungbuk: require('~/assets/images/id-bg-kr-chungbuk.png'),
      jeonnam: require('~/assets/images/id-bg-kr-jeonnam.png'),
      jeonbuk: require('~/assets/images/id-bg-kr-jeonbuk.png'),
      gyeongnam: require('~/assets/images/id-bg-kr-gyeongnam.png'),
      gyeongbuk: require('~/assets/images/id-bg-kr-gyeongbuk.png'),
      ulsan: require('~/assets/images/id-bg-kr-ulsan.png'),
      jeju: require('~/assets/images/id-bg-kr-jeju.png'),
    },
  };

  useEffect(() => {
    if (profile.city?.name) {
      const cityKey = profile.city.name.toLowerCase();
      const code = profile.city.coutryCode.toLowerCase();
      setBgSource(cityKey);
      setCountryCode(code);
    }
  }, [profile]);

  const handleQr = useCallback(async () => {
    navigation.push(MENU.STACK.SCREEN.QR);
  }, []);

  const handleHistory = useCallback(async () => {
    navigation.push(MENU.STACK.SCREEN.HISTORY);
  }, []);

  const navigateToQR = useCallback(() => {
    Vibration.vibrate(50); // 햅틱 피드백
    navigation.push(MENU.STACK.SCREEN.QR);
  }, [navigation]);

  const navigateBack = useCallback(() => {
    Vibration.vibrate(50); // 햅틱 피드백
    navigation.goBack();
  }, [navigation]);

  // 스와이프 제스처 설정
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // 스와이프 중일 때 화면을 약간 이동 및 스케일 조정 (시각적 피드백)
      translateX.value = event.translationX * 0.3;
      
      // 스와이프 정도에 따른 스케일 조정
      const progress = Math.abs(event.translationX) / 200;
      scale.value = interpolate(progress, [0, 1], [1, 0.95], Extrapolate.CLAMP);
    })
    .onEnd((event) => {
      const { translationX: deltaX, velocityX } = event;
      
      // 원래 위치로 복귀
      translateX.value = withSpring(0);
      scale.value = withSpring(1);
      
      // 스와이프 임계값 설정
      const swipeThreshold = 100;
      const velocityThreshold = 500;
      
      if (deltaX > swipeThreshold || velocityX > velocityThreshold) {
        // 오른쪽 스와이프 - 이전 화면으로
        runOnJS(navigateBack)();
      } else if (deltaX < -swipeThreshold || velocityX < -velocityThreshold) {
        // 왼쪽 스와이프 - QR 화면으로
        runOnJS(navigateToQR)();
      }
    })
    .activeOffsetX([-20, 20])  // 가로 스와이프만 감지
    .failOffsetY([-20, 20]);   // 세로 스크롤과 충돌 방지

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ] as any,
    };
  });

  // 스와이프 인디케이터 스타일
  const leftIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50],
      [0.3, 0.8],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-50, 0],
      [0.8, 0.3],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  useFocusEffect(
    useCallback(() => {
      setSafeAreaColor('#FAEFE7');

      return () => {
        setSafeAreaColor(COLOR.WHITE);
      };
    }, []),
  );

  console.log(countryCode);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[style.container, animatedStyle]}>
        {/* 왼쪽 스와이프 인디케이터 (뒤로 가기) */}
        <Animated.View style={[
          {
            position: 'absolute',
            left: 20,
            top: '50%',
            zIndex: 1000,
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          },
          leftIndicatorStyle
        ]}>
          <Text style={{ fontSize: 18, color: '#666' }}>←</Text>
        </Animated.View>

        {/* 오른쪽 스와이프 인디케이터 (QR로) */}
        <Animated.View style={[
          {
            position: 'absolute',
            right: 20,
            top: '50%',
            zIndex: 1000,
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          },
          rightIndicatorStyle
        ]}>
          <Text style={{ fontSize: 18, color: '#666' }}>→</Text>
        </Animated.View>

        <FastImage source={STATIC_IMAGE.IDCARD_BG} style={style.containerImageBg} resizeMode="contain" />
        <Header title="Mobile Identification" />
        <ScrollView contentContainerStyle={style.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={style.body}>
            <View style={style.bodyContent}>
              <View style={style.idcardPendingCard}>
                <View style={{ width: 300, height: 450, position: 'relative', marginTop: 30 }}>
                  <ImageBackground
                    source={!!countryCode && !!bgSource && cityBackgrounds[countryCode] && cityBackgrounds[countryCode][bgSource]}
                    style={style.idcardPendingCard}>
                    <View style={{ width: 300, height: 450, paddingVertical: 24, paddingHorizontal: 21, position: 'relative' }}>
                      <View
                        style={{
                          width: 120,
                          height: 160,
                          backgroundColor: 'red',
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}>
                        {profile.profileImage && (
                          <FastImage source={{ uri: profile.profileImage }} style={style.faceImage} resizeMode="cover" />
                        )}
                      </View>
                      <View style={{ display: 'flex', alignItems: 'flex-end', position: 'absolute', top: 24, right: 21 }}>
                        <Flag countryCode={countryCode} />
                        <Text style={[font.BODY2_M, { color: COLOR.UI_COLOR_400 }]}>{profile.city?.country}</Text>
                      </View>
                      <Text style={[font.SUBTITLE1_SB, style.nameText]}>{profile.name}</Text>
                    </View>
                  </ImageBackground>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 46 }}>
                  <View style={style.honoraryWrap}>
                    <Text style={[font.CAPTION2, style.honoraryText]}>HONORARY CITIZEN OF {profile.city.name}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={[style.bottomButtonWrap, { height: 85 + bottom, paddingTop: 15 + bottom / 10 }]}>
          <Button style={style.bottomButton} onPress={handleQr}>
            <FastImage source={STATIC_IMAGE.MAIN_BUTTON_2} style={style.bottomButtonImage} resizeMode="contain" />
            <Text style={[font.BODY3_SB, style.bottomButtonText]}>QR{'\n'}Code</Text>
          </Button>
          <View style={[style.bottomButtonSeparator, { marginTop: 14 + bottom / 10 }]} />
          <Button style={style.bottomButton} onPress={handleHistory}>
            <FastImage source={STATIC_IMAGE.MAIN_BUTTON_3} style={style.bottomButtonImage} resizeMode="contain" />
            <Text style={[font.BODY3_SB, style.bottomButtonText]}>Visitor{'\n'}History</Text>
          </Button>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});
