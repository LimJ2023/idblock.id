import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { StatusBar, View } from 'react-native';

import Scanner, { DetectedRectangle, PictureCallbackProps } from 'react-native-rectangle-scanner';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';

import { CameraDecorator } from '~/components/CameraDecorator';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const ModalRectangleScanner = memo(function ({ isVisible, onSubmit, onClose }: Props) {
  const scannerRef = useRef<any>();

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [detectedRectangle, setDetectedRectangle] = useState<DetectedRectangle>();

  const { dimension } = useDimension();

  const handleShow = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, []);

  const handleRectangleDetected = useCallback((data: { detectedRectangle: DetectedRectangle }) => {
    if (data.detectedRectangle?.dimensions?.width > 100 && data.detectedRectangle?.dimensions?.height > 100) {
      setDetectedRectangle(data.detectedRectangle);
    } else {
      setDetectedRectangle(undefined);
    }
  }, []);

  const handleCapture = useCallback(() => {
    scannerRef.current?.capture();
  }, []);

  const handleImageProcessed = useCallback((data: PictureCallbackProps) => {
    handleClose();
    onSubmit?.(data.initialImage);
  }, []);

  useEffect(() => {
    setDetectedRectangle(undefined);

    if (!isVisible) {
      setIsLoaded(false);
    }
  }, [isVisible]);

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
      onModalShow={handleShow}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}>
      <View style={style.container}>
        <View style={style.header}>
          <Button style={style.headerCloseButton} onPress={handleClose}>
            <FastImage source={STATIC_IMAGE.CLOSE_WHITE} style={style.headerCloseButtonImage} resizeMode="contain" />
          </Button>
        </View>
        <View style={style.cameraWrap}>
          <CameraDecorator isVisible={isLoaded} isActivated={!!detectedRectangle} />
          <Scanner
            ref={scannerRef}
            style={{ flex: 1 }}
            onRectangleDetected={handleRectangleDetected}
            onPictureProcessed={handleImageProcessed}
          />
          <View style={style.captureButtonWrap}>
            <Button
              style={[style.captureButton, { backgroundColor: detectedRectangle ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
              disabled={!detectedRectangle}
              onPress={handleCapture}>
              <Text style={[font.BODY3_B, { color: detectedRectangle ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Take a photo</Text>
            </Button>
          </View>
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
