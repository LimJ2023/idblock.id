import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { font, globalStyle } from '~/style';

import style from './style';

export const Confirm = memo(function ({ isVisible, message, cancelText, okText, onCancel, onOk }: Props) {
  const handleClose = useCallback(() => {
    onCancel?.();
  }, []);

  const handleOk = useCallback(() => {
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
          <Text style={[font.BODY1_R, style.messageText]}>{message}</Text>
          <View style={style.buttonWrap}>
            <Button style={style.cancelButton} onPress={handleClose}>
              <Text style={[font.BODY1_B, style.cancelButtonText]}>{cancelText || 'No'}</Text>
            </Button>
            <Button style={style.okButton} onPress={handleOk}>
              <Text style={[font.BODY1_B, style.okButtonText]}>{okText || 'Yes'}</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  message: string;
  cancelText?: string;
  okText?: string;
  onCancel?: () => void;
  onOk?: () => void;
}
