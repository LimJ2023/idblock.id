import React, { memo } from 'react';

import { ActivityIndicator, StatusBar, View } from 'react-native';

import Modal from 'react-native-modal';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { COLOR } from '~/utils/guide';

import style from './style';

export const ModalSpinner = memo(function ({ isVisible }: Props) {
  const { dimension } = useDimension();

  if (!dimension?.height) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      style={style.modal}
      statusBarTranslucent={true}
      deviceWidth={dimension.width}
      deviceHeight={dimension.height + StatusBar.currentHeight}
      animationIn="fadeIn"
      animationInTiming={MODAL_ANIMATION_TIMING}
      animationOut="fadeOut"
      animationOutTiming={MODAL_ANIMATION_TIMING}
      useNativeDriver={true}>
      <View style={style.container}>
        <ActivityIndicator size="large" color={COLOR.PRI_1_500} />
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
}
