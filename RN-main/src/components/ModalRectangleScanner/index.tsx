import React, { memo, useCallback, useState } from 'react';
import { StatusBar, View, Image, Alert } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';
import { useDimension } from '~/zustands/app';
import { MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const ModalRectangleScanner = memo(function ({ isVisible, onSubmit, onClose }: Props) {
  const [scannedImage, setScannedImage] = useState<string | undefined>(undefined);
  const { dimension } = useDimension();

  const handleClose = useCallback(() => {
    onClose?.();
    setScannedImage(undefined);
  }, [onClose]);

  const handleScan = useCallback(async () => {
    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument();
      if (status === 'success' && scannedImages.length > 0) {
        setScannedImage(scannedImages[0]);
        onSubmit?.(scannedImages[0]);
        handleClose();
      }
    } catch (e) {
      Alert.alert('스캔 실패', '문서 스캔 중 오류가 발생했습니다.');
    }
  }, [onSubmit, handleClose]);

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
      useNativeDriver={true}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}
    >
      <View style={style.container}>
        <View style={style.header}>
          <Button style={style.headerCloseButton} onPress={handleClose}>
            <Image source={STATIC_IMAGE.CLOSE_WHITE} style={style.headerCloseButtonImage} resizeMode="contain" />
          </Button>
        </View>
        <View style={style.cameraWrap}>
          <Button
            style={[style.captureButton, { backgroundColor: COLOR.PRI_1_500 }]}
            onPress={handleScan}
          >
            <Text style={[font.BODY3_B, { color: COLOR.WHITE }]}>scannedImage</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  onSubmit?: (image: string) => void;
  onClose?: () => void;
}
