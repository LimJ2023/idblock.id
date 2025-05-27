import React, { memo, useCallback, useEffect,  useRef, useState } from 'react';
import { Platform, StatusBar, View, Alert } from 'react-native';
import {
  Frame,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Camera as DetectorCamera, Face } from 'react-native-vision-camera-face-detector';
import {  runOnJS } from 'react-native-reanimated';
import FastImage from '@d11/react-native-fast-image';
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



/* ---------------- Types ---------------- */
interface Props {
  isVisible: boolean;
  onSubmit?: (uri: string) => void;
  onClose?: () => void;
}
interface FaceBorder {
  width: number;
  height: number;
  x: number;
  y: number;
}

/* ---------------- Component ---------------- */
export const ModalFaceDetectCamera = memo(({ isVisible, onSubmit, onClose }: Props) => {
  const cameraRef = useRef<any>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceBorder, setFaceBorder] = useState<FaceBorder>();
  const submitLock = useRef(false);

  const { dimension } = useDimension();
  const device = useCameraDevice('front');

  /* permission */
  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const ok = await requestPermission();
        if (!ok) {
          Alert.alert('권한 필요', '카메라 권한을 허용해 주세요.');
          onClose?.();
        }
      }
    })();
  }, [hasPermission, onClose, requestPermission]);

  /* UI */
  const handleClose = useCallback(() => onClose?.(), [onClose]);
  const handleShow = useCallback(() => setIsLoaded(true), []);

  /* JS 얼굴 박스 계산 */
  const calcFaceBorder = useCallback(
    throttle((faces: Face[], dim: { width: number; height: number }) => {
      let pick: FaceBorder | undefined;
      const min = Math.min(dim.width, dim.height) * 0.2;
      faces.forEach((f) => {
        const b = f.bounds;
        if (!b) return;
        if (b.width > min && b.height > min) {
          if (!pick || b.width * b.height > pick.width * pick.height) pick = b;
        }
      });
      setFaceBorder(pick);
    }, 400),
    [],
  );

  /* worklet → JS bridge */
  // const faceDetectionCallback = useMemo(() =>
  //   Worklets.createRunOnJS(
  //     (faces: Face[], frame: Frame) => {
  //       'worklet';
  //       const dims = { width: frame.width, height: frame.height };
  //       calcFaceBorder(faces, dims);
  //     },
  //   ),
  //   [calcFaceBorder],
  // );

/* ---------- worklet ➜ JS ---------- */
type SimpleFace = { bounds: Face['bounds']; roll?: number; yaw?: number };
type Dims = { width: number; height: number };

/** worklet 등록 */
const faceDetectionCallback = useCallback(
  (faces: Face[], frame: Frame) => {
    'worklet';

    // 1️⃣ Face → JSON-호환 객체로 복사
    const simple = faces.map(f => ({
      bounds: f.bounds,
      roll: f.rollAngle,
      yaw: f.yawAngle,
    })) as SimpleFace[];

    // 2️⃣ 프레임 해상도만 추출
    const dims = { width: frame.width, height: frame.height } as Dims;

    // 3️⃣ JS 함수 호출
    runOnJS(calcFaceBorder)(simple, dims);
  },
  [calcFaceBorder],
);



  /* capture */
  const handleCapture = useCallback(async () => {
    if (submitLock.current || !cameraRef.current) return;
    submitLock.current = true;
    try {
      // @ts-ignore – DetectorCamera keeps same API as VisionCamera
      const file = await cameraRef.current.takePhoto({ enableShutterSound: true });
      if (file?.path) {
        handleClose();
        onSubmit?.(Platform.select({ ios: file.path, android: `file://${file.path}` })!);
      }
    } catch (e) {
      Alert.alert('오류', '사진 촬영 실패');
    } finally {
      submitLock.current = false;
    }
  }, [handleClose, onSubmit]);

  /* modal reset */
  useEffect(() => {
    if (!isVisible) {
      setIsLoaded(false);
      setFaceBorder(undefined);
    }
    submitLock.current = false;
  }, [isVisible]);

  /* render */
  return (
    <Modal
      isVisible={isVisible}
      style={style.modal}
      statusBarTranslucent
      deviceWidth={dimension.width}
      deviceHeight={dimension.height + StatusBar.currentHeight}
      animationIn="fadeIn"
      animationInTiming={MODAL_ANIMATION_TIMING}
      animationOut="fadeOut"
      animationOutTiming={MODAL_ANIMATION_TIMING}
      useNativeDriver
      onModalShow={handleShow}
      onBackButtonPress={handleClose}
      onBackdropPress={handleClose}
    >
      <View style={style.container}>
        {/* header */}
        <View style={style.header}>
          <Button style={style.headerCloseButton} onPress={handleClose}>
            <FastImage source={STATIC_IMAGE.CLOSE_WHITE} style={style.headerCloseButtonImage} resizeMode="contain" />
          </Button>
        </View>

        {/* camera */}
        {device && hasPermission ? (
          <View style={style.cameraWrap}>
            <CameraDecorator isVisible={isLoaded} isActivated={!!faceBorder} />
            <DetectorCamera
              ref={cameraRef}
              style={{ flex: 1 }}
              device={device}
              isActive
              photo
              enableLocation={false}
              faceDetectionCallback={faceDetectionCallback}
              faceDetectionOptions={{ performanceMode: 'accurate', landmarkMode: 'none' }}
              onInitialized={() => setIsCameraReady(true)}
              onError={(e) => {
                Alert.alert('카메라 오류', '카메라 초기화 실패');
                handleClose();
              }}
            />
            <View style={style.captureButtonWrap}>
              <Button
                style={[style.captureButton, { backgroundColor: faceBorder ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
                disabled={!faceBorder || !isCameraReady}
                onPress={handleCapture}
              >
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
