import React, { memo, useCallback, useEffect, useState } from 'react';

import { StatusBar, View } from 'react-native';

import Modal from 'react-native-modal';
import FastImage from '@d11/react-native-fast-image';
import Pdf, { Source } from 'react-native-pdf';

import { Button } from '~/components/Button';

import { useDimension } from '~/zustands/app';

import { MODAL_ANIMATION_TIMING, STATIC_IMAGE } from '~/utils/constant';

import style from './style';

export const ModalPdfViewer = memo(function ({ isVisible, uri, onClose }: Props) {
  const [pdfSource, setPdfSource] = useState<Source>();

  const { dimension } = useDimension();

  const handleClose = useCallback(() => {
    onClose?.();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setPdfSource({
        uri,
        cache: false,
      });
    } else {
      setPdfSource(undefined);
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
        {isVisible && pdfSource && (
          <Pdf
            source={pdfSource}
            trustAllCerts={false}
            onLoadComplete={(numberOfPages, filePath) => {}}
            onPageChanged={(page, numberOfPages) => {}}
            onError={(error) => {}}
            onPressLink={(uri) => {}}
            style={[style.pdf, { width: dimension.width, height: dimension.height }]}
          />
        )}
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  uri: string;
  onClose?: () => void;
}
