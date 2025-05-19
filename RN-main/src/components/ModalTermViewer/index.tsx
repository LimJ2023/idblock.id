import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { StatusBar, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';

import { Button } from '~/components/Button';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';

import style from './style';

export const ModalTermViewer = memo(function ({ isVisible, html, onClose }: Props) {
  const [htmlSource, setHtmlSource] = useState<string>();

  const { dimension } = useDimension();

  const htmlRef = useRef<string>();

  if (htmlRef.current !== html) {
    htmlRef.current = html;
  }

  const handleClose = useCallback(() => {
    onClose?.();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setHtmlSource(htmlRef.current);
    } else {
      setHtmlSource(undefined);
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      style={style.modal}
      statusBarTranslucent={true}
      deviceWidth={dimension.width}
      deviceHeight={dimension.height + StatusBar.currentHeight}
      animationIn="slideInRight"
      animationInTiming={MODAL_ANIMATION_TIMING}
      animationOut="slideOutRight"
      animationOutTiming={MODAL_ANIMATION_TIMING}
      useNativeDriver={true}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <View style={style.container}>
        <View style={style.header}>
          <Button style={style.headerCloseButton} onPress={handleClose}>
            <FastImage source={STATIC_IMAGE.CLOSE_BLACK} style={style.headerCloseButtonImage} resizeMode="contain" />
          </Button>
        </View>
        {isVisible && htmlSource && <WebView source={{ html: htmlSource }} style={{ flex: 1 }} />}
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  html: string;
  onClose?: () => void;
}
