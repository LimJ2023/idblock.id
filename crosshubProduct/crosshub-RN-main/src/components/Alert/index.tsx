import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { font, globalStyle } from '~/style';

import style from './style';

export const Alert = memo(function ({ title, isVisible, message, okText, onOk }: Props) {
  const handleClose = useCallback(() => {
    onOk?.();
  }, []);

  return (
    <Modal
      isVisible={isVisible}
      style={globalStyle.modal}
      statusBarTranslucent={true}
      backdropColor="transparent"
      animationIn="fadeIn"
      animationInTiming={MODAL_ANIMATION_TIMING}
      animationOut="fadeOut"
      animationOutTiming={MODAL_ANIMATION_TIMING}
      onBackButtonPress={handleClose}>
      <View style={style.container}>
        <View style={style.body}>
          {title && <Text style={[font.SUBTITLE3_SB, style.messageText, { marginBottom: 8 }]}>{title}</Text>}
          <Text style={[font.BODY1_R, style.messageText]}>{message}</Text>
          <Button style={style.okButton} onPress={handleClose}>
            <Text style={[font.BODY1_B, style.okButtonText]}>{okText || 'Confirm'}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  title?: string;
  isVisible: boolean;
  message: string;
  okText?: string;
  onOk?: () => void;
}
