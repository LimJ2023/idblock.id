import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image';

import { ModalTermViewer } from '~/components/ModalTermViewer';
import { Button } from '~/components/Button';
import { Header } from '~/components/Header';
import { Check } from '~/components/Check';
import { Text } from '~/components/Text';

import { useGetTermList } from '~/hooks/get.term.list';
import { 
  useSignupTermsData, 
  useSignupAction, 
  useSignupEmailData,
  SignupStep
} from '~/zustands/signup';

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { CheckItem } from '~/types/check.item';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';
import { getNextScreenInFlow, SIGNUP_FLOW } from '~/utils/screenFlow';

export const SignupTerm = memo(function ({ route }: Params) {
  const { uuid, mail } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  // Zustand store에서 데이터 가져오기
  const termsData = useSignupTermsData();
  const emailData = useSignupEmailData();
  const signupAction = useSignupAction();

  const [termHtmlSource, setTermHtmlSource] = useState<string>('');

  const { getTermList } = useGetTermList();
  const { bottom } = useSafeAreaInsets();

  // 컴포넌트 마운트 시 현재 단계 설정
  useEffect(() => {
    signupAction.setCurrentStep(SignupStep.TERMS);
  }, [signupAction]);

  const handleAllChecked = useCallback((isChecked: boolean) => {
    const updatedCheckList = termsData.checkList.map(item => ({
      ...item,
      isChecked
    }));

    signupAction.setCheckList(updatedCheckList);
    signupAction.setAllChecked(isChecked);
  }, [termsData.checkList, signupAction]);

  const handleChecked = useCallback((index: number) => {
    const updatedCheckList = [...termsData.checkList];
    updatedCheckList[index].isChecked = !updatedCheckList[index].isChecked;

    signupAction.setCheckList(updatedCheckList);

    // 모든 필수 약관이 체크되었는지 확인
    const allRequiredChecked = updatedCheckList
      .filter(item => item.isMandatory)
      .every(item => item.isChecked);
    
    // 전체 동의 상태 업데이트
    const allChecked = updatedCheckList.every(item => item.isChecked);
    signupAction.setAllChecked(allChecked);
  }, [termsData.checkList, signupAction]);

  const handlePdfViewer = useCallback((item: CheckItem) => {
    setTermHtmlSource(item.html);
  }, []);

  const handleNext = useCallback(() => {
    // 단계 완료 표시
    signupAction.completeStep(SignupStep.TERMS);
    
    const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_TERM);
    
    if (nextScreen) {
      navigation.push(nextScreen, {
        uuid: emailData.uuid || uuid,
        mail: emailData.email || mail,
      });
    } else {
      console.warn('No next screen found in signup flow');
    }
  }, [signupAction, emailData, uuid, mail, navigation]);

  const MemoAllCheckLeftChild = useMemo(() => {
    if (termsData.isAllChecked) {
      return <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_PRI} style={style.checkedImage} resizeMode="contain" />;
    }

    return <View style={style.allUnchecked} />;
  }, [termsData.isAllChecked]);

  const MemoizedCheckLeftChild = useCallback(
    (item: CheckItem) => {
      if (item.isChecked) {
        return <FastImage source={STATIC_IMAGE.CHECK_PRI} style={style.checkedImage} resizeMode="contain" />;
      }

      return <FastImage source={STATIC_IMAGE.CHECK_GRAY} style={style.checkedImage} resizeMode="contain" />;
    },
    [termsData.isAllChecked],
  );

  useEffect(() => {
    getTermList().then((_checkList) => {
      signupAction.setCheckList(_checkList);
    });
  }, [signupAction, getTermList]);

  const isVisibleNextButton = !termsData.checkList.filter((el) => el.isMandatory && !el.isChecked).length;

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <ModalTermViewer isVisible={!!termHtmlSource} html={termHtmlSource} onClose={() => setTermHtmlSource('')} />
      <Header title="Terms of Service" />
      <View style={style.body}>
        <View style={style.bodyContent}>
          <View style={style.termWrap}>
            <Check
              leftChild={MemoAllCheckLeftChild}
              leftWrapStyle={style.checkAllLeftWrap}
              centerChild={<Text style={[font.BODY1_SB, style.termTitleText]}>I agree to all required and optional agreements.</Text>}
              centerWrapStyle={style.checkAllCenterWrap}
              onChecked={handleAllChecked}
            />
            <View style={style.termListWrap}>
              {termsData.checkList.map((el, index) => (
                <View key={index} style={style.checkWrap}>
                  <Check
                    leftChild={MemoizedCheckLeftChild(el)}
                    leftWrapStyle={style.checkLeftWrap}
                    centerChild={
                      <Text style={[font.BODY2_R, style.termTitleText]}>{`${el.isMandatory ? '[Mandatory] ' : ''}${el.text}`}</Text>
                    }
                    centerWrapStyle={style.checkCenterWrap}
                    rightChild={
                      <Button onPress={() => handlePdfViewer(el)} style={style.checkRightButton}>
                        <FastImage source={STATIC_IMAGE.ARROW_RIGHT_GRAY} style={style.checkRightImage} resizeMode="contain" />
                      </Button>
                    }
                    rightWrapStyle={style.checkRightWrap}
                    onChecked={() => handleChecked(index)}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={style.nextButtonWrap}>
          <Button
            style={[style.nextButton, { backgroundColor: isVisibleNextButton ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!isVisibleNextButton}
            onPress={handleNext}>
            <Text style={[font.BODY3_SB, { color: isVisibleNextButton ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Next</Text>
          </Button>
        </View>
      </View>
    </View>
  );
});

interface Params {
  route: Route<string, NavigationParams>;
}

interface NavigationParams {
  uuid: string;
  mail: string;
}
