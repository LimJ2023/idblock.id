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

import { MENU, STATIC_IMAGE } from '~/utils/constant';
import { CheckItem } from '~/types/check.item';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const SignupTerm = memo(function ({ route }: Params) {
  const { uuid, mail } = route.params;

  const navigation = useNavigation<StackNavigationProp<any>>();

  const [isAllChecked, setIsAllChecked] = useState<boolean>(false);
  const [checkList, setCheckList] = useState<CheckItem[]>([]);
  const [termHtmlSource, setTermHtmlSource] = useState<string>('');

  const { getTermList } = useGetTermList();
  const { bottom } = useSafeAreaInsets();

  const handleAllChecked = useCallback((isChecked: boolean) => {
    setCheckList((prevCheckList: CheckItem[]) => {
      const copyCheckList = [...prevCheckList];

      for (const el of copyCheckList) {
        el.isChecked = isChecked;
      }

      return copyCheckList;
    });

    setIsAllChecked(isChecked);
  }, []);

  const handleChecked = useCallback((index: number) => {
    setCheckList((prevCheckList: CheckItem[]) => {
      const copyCheckList = [...prevCheckList];
      copyCheckList[index].isChecked = !copyCheckList[index].isChecked;

      return copyCheckList;
    });
  }, []);

  const handlePdfViewer = useCallback((item: CheckItem) => {
    setTermHtmlSource(item.html);
  }, []);

  const handleNext = useCallback(() => {
    navigation.push(MENU.STACK.SCREEN.SIGNUP_FORM, {
      uuid,
      mail,
    });
  }, []);

  const MemoAllCheckLeftChild = useMemo(() => {
    if (isAllChecked) {
      return <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_PRI} style={style.checkedImage} resizeMode="contain" />;
    }

    return <View style={style.allUnchecked} />;
  }, [isAllChecked]);

  const MemoizedCheckLeftChild = useCallback(
    (item: CheckItem) => {
      if (item.isChecked) {
        return <FastImage source={STATIC_IMAGE.CHECK_PRI} style={style.checkedImage} resizeMode="contain" />;
      }

      return <FastImage source={STATIC_IMAGE.CHECK_GRAY} style={style.checkedImage} resizeMode="contain" />;
    },
    [isAllChecked],
  );

  useEffect(() => {
    getTermList().then((_checkList) => {
      setCheckList(_checkList);
    });
  }, []);

  const isVisibleNextButton = !checkList.filter((el) => el.isMandatory && !el.isChecked).length;

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
              {checkList.map((el, index) => (
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
