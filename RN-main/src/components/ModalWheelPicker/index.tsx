import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Platform, StatusBar, View } from 'react-native';
import { getBottomSpace, isIphoneX } from 'react-native-iphone-screen-helper';
import WheelPicker from 'react-native-wheely';
import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { font, globalStyle } from '~/style';
import { COLOR } from '~/utils/guide';

import style from './style';

export const ModalWheelPicker = memo(function ({
  isVisible,
  isEnableClear,
  title,
  initIndex,
  placeholder,
  data,
  onClose,
  onSubmit,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const { dimension } = useDimension();

  const initIndexRef = useRef<number>();

  if (initIndexRef.current !== initIndex) {
    initIndexRef.current = initIndex;
  }

  const selectedIndexRef = useRef<number>();

  if (selectedIndexRef.current !== selectedIndex) {
    selectedIndexRef.current = selectedIndex;
  }

  const handleChange = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    onClose();
    onSubmit(selectedIndexRef.current - 1);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setSelectedIndex(initIndexRef.current === undefined ? 0 : initIndexRef.current + 1);
    } else {
      setSelectedIndex(0);
    }
  }, [isVisible]);

  const isAbleSubmit = isEnableClear || selectedIndex;

  return (
    <Modal
      isVisible={isVisible}
      style={style.modal}
      statusBarTranslucent={true}
      deviceWidth={dimension.width}
      deviceHeight={dimension.height + StatusBar.currentHeight}
      animationIn="slideInUp"
      animationInTiming={MODAL_ANIMATION_TIMING}
      animationOut="slideOutDown"
      animationOutTiming={MODAL_ANIMATION_TIMING}
      useNativeDriver={true}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <View
        style={[
          globalStyle.modalHeader,
          style.pickerWrap,
          { height: dimension.height * Platform.select({ android: 0.55, ios: isIphoneX() ? 0.55 : 0.6 }) - getBottomSpace() },
        ]}>
        <View style={style.pickerTitleWrap}>
          <Text style={[font.BODY1_M, style.pickerTitleText]}>{title}</Text>
        </View>
        <WheelPicker
          selectedIndex={selectedIndex}
          visibleRest={3}
          options={[placeholder || 'Choose', ...data]}
          selectedIndicatorStyle={style.selectedIndicatorStyle}
          itemTextStyle={{ ...font.BODY1_R, ...style.pickerItemText }}
          opacityFunction={(x) => Math.pow(1 / 2.5, x)}
          onChange={handleChange}
        />
        <View style={style.buttonWrap}>
          <Button
            style={[style.button, { backgroundColor: isAbleSubmit ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!isAbleSubmit}
            onPress={handleSubmit}>
            <Text style={[font.BODY3_SB, style.buttonText]}>Choose</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  isEnableClear?: boolean;
  title?: string;
  initIndex?: number;
  placeholder?: string;
  data: string[];
  onClose?: () => void;
  onSubmit?: (selectedIndex: number) => void;
}
