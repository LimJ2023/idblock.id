import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Platform, StatusBar, View } from 'react-native';

import { Camera, Face } from 'react-native-vision-camera-face-detector';
import { Camera as CameraProps, Frame, useCameraDevice } from 'react-native-vision-camera';
import FastImage from 'react-native-fast-image';
import throttle from 'lodash.throttle';
import Modal from 'react-native-modal';

import { CameraDecorator } from '~/components/CameraDecorator';
import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const ModalFaceDetectCamera = memo(function ({ isVisible, onSubmit, onClose }: Props) {
  const cameraRef = useRef<CameraProps>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [faceBorder, setFaceBorder] = useState<FaceBorder>();

  const { dimension } = useDimension();

  const device = useCameraDevice('front');

  const isSubmitRef = useRef<boolean>(false);

  const faceBorderRef = useRef<FaceBorder>();

  if (faceBorderRef.current !== faceBorder) {
    faceBorderRef.current = faceBorder;
  }

  const handleShow = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, []);

  const handleCapture = useCallback(async () => {
    if (!isSubmitRef.current) {
      isSubmitRef.current = true;

      // 개발 모드에서는 더미 이미지 사용
      if (__DEV__) {
        console.log('📷 개발 모드: 더미 얼굴 이미지 자동 제출');
        handleClose();
        onSubmit?.('file:///android_asset/public/pexels-justin-shaifer-501272-1222271.jpg');
        return;
      }

      const file = await cameraRef.current?.takePhoto?.({
        enableShutterSound: true,
      });

      if (file?.path) {
        handleClose();

        onSubmit?.(
          Platform.select({
            ios: file.path,
            android: 'file://' + file.path,
          }),
        );
      }
    }
  }, []);

  // 개발 모드에서 자동으로 더미 얼굴 감지 시뮬레이션
  const handleMockFaceDetection = useCallback(() => {
    if (__DEV__) {
      console.log('🎭 개발 모드: 더미 얼굴 감지 시뮬레이션');
      setFaceBorder({
        width: 200,
        height: 250,
        x: 100,
        y: 150,
      });
    }
  }, []);

  const handleDetectedFaces = useCallback(
    throttle(async (faces: Face[], frame: Frame) => {
      let bigFace: FaceBorder = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      };

      const face = faces['0'];
      // for (const face of faces) {
      const border = face.bounds;

      if (border?.width > 100 && border?.height > 100) {
        if (border.width * border.height > bigFace.width * bigFace.height) {
          bigFace = border;
        }
      }
      // }

      if (bigFace.width) {
        setFaceBorder(bigFace);
      } else {
        setFaceBorder(undefined);
      }
    }, 200),
    [],
  );

  useEffect(() => {
    setFaceBorder(undefined);

    if (!isVisible) {
      setIsLoaded(false);
    }

    isSubmitRef.current = false;

    // 개발 모드에서 자동으로 얼굴 감지 시뮬레이션
    if (__DEV__ && isVisible) {
      const timer = setTimeout(() => {
        handleMockFaceDetection();
      }, 1500); // 1.5초 후 자동으로 얼굴 감지

      return () => clearTimeout(timer);
    }
  }, [isVisible, handleMockFaceDetection]);

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
        {device ? (
          <View style={style.cameraWrap}>
            <CameraDecorator isVisible={isLoaded} isActivated={!!faceBorder} />
            <Camera
              ref={cameraRef}
              isActive={true}
              enableLocation={false}
              style={{ flex: 1 }}
              photo={true}
              device={device}
              faceDetectionCallback={handleDetectedFaces}
              faceDetectionOptions={{
                performanceMode: 'accurate',
                landmarkMode: 'all',
              }}
              onError={(error) => {
                console.log(error);
              }}
            />
            <View style={style.captureButtonWrap}>
              <Button
                style={[style.captureButton, { backgroundColor: faceBorder ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
                disabled={!faceBorder}
                onPress={handleCapture}>
                <Text style={[font.BODY3_B, { color: faceBorder ? COLOR.WHITE : COLOR.PRI_3_600 }]}>Take a photo</Text>
              </Button>
            </View>
          </View>
        ) : (
          <View style={style.empty} />
        )}
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  onSubmit?: (image: string) => void;
  onClose?: () => void;
}

interface FaceBorder {
  width: number;
  height: number;
  x: number;
  y: number;
}
