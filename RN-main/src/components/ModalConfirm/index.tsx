import React, { memo, useCallback } from 'react';

import { View } from 'react-native';

import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { MODAL_ANIMATION_TIMING } from '~/utils/constant';
import { font, globalStyle } from '~/style';

import style from './style';

export const ModalConfirm = memo(function ({ 
  title, 
  isVisible, 
  message, 
  cancelText, 
  confirmText, 
  onCancel, 
  onConfirm 
}: Props) {
  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

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
      onBackButtonPress={handleCancel}>
      <View style={style.container}>
        <View style={style.body}>
          {title && <Text style={[font.SUBTITLE3_SB, style.titleText]}>{title}</Text>}
          <Text style={[font.BODY1_R, style.messageText]}>{message}</Text>
          <View style={style.buttonContainer}>
            <Button style={style.cancelButton} onPress={handleCancel}>
              <Text style={[font.BODY1_B, style.cancelButtonText]}>{cancelText || 'Cancel'}</Text>
            </Button>
            <Button style={style.confirmButton} onPress={handleConfirm}>
              <Text style={[font.BODY1_B, style.confirmButtonText]}>{confirmText || 'Confirm'}</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  title?: string;
  isVisible: boolean;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
} 