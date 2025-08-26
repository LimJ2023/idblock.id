import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Platform, StatusBar, View } from 'react-native';

import { Camera as CameraProps, useCameraDevice } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
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



  const handleDetectedFaces = useCallback(
    throttle(async (imagePath: string) => {
      try {
        const faces = await FaceDetection.detect(imagePath, {
          performanceMode: 'accurate',
          landmarkMode: 'all',
          classificationMode: 'all',
        });

        let bigFace: FaceBorder = {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        };

        if (faces.length > 0) {
          const face = faces[0];
          const bounds = face.bounds;

          if (bounds.width > 100 && bounds.height > 100) {
            bigFace = {
              width: bounds.width,
              height: bounds.height,
              x: bounds.left,
              y: bounds.top,
            };
          }
        }

        if (bigFace.width) {
          setFaceBorder(bigFace);
        } else {
          setFaceBorder(undefined);
        }
      } catch (error) {
        console.log('Face detection error:', error);
        setFaceBorder(undefined);
      }
    }, 500),
    [],
  );

  // 주기적으로 얼굴 감지를 수행하는 함수
  const startFaceDetection = useCallback(async () => {
    if (!cameraRef.current || !isVisible || !isLoaded) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: false,
        skipMetadata: true,
      });

      if (photo?.path) {
        const fullPath = Platform.select({
          ios: photo.path,
          android: 'file://' + photo.path,
        });

        if (fullPath) {
          await handleDetectedFaces(fullPath);
        }
      }
    } catch (error) {
      console.log('Face detection photo error:', error);
    }
  }, [isVisible, isLoaded, handleDetectedFaces]);

  useEffect(() => {
    setFaceBorder(undefined);

    if (!isVisible) {
      setIsLoaded(false);
    }

    isSubmitRef.current = false;

  }, [isVisible]);

  // 얼굴 감지를 위한 주기적 스캔
  useEffect(() => {
    if (!isVisible || !isLoaded) return;

    const interval = setInterval(() => {
      startFaceDetection();
    }, 1000); // 1초마다 얼굴 감지

    return () => clearInterval(interval);
  }, [isVisible, isLoaded, startFaceDetection]);

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
            <CameraProps
              ref={cameraRef}
              isActive={isVisible && isLoaded}
              enableLocation={false}
              style={{ flex: 1 }}
              photo={true}
              device={device}
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
