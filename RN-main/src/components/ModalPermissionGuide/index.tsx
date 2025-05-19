import React, { memo, useCallback } from 'react';

import { Linking, Platform, StatusBar, View } from 'react-native';

import Modal from 'react-native-modal';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { PACKAGE_NAME } from '~/utils/constant';
import { font } from '~/style';

import style from './style';

export const ModalPermissionGuide = memo(function ({ isVisible, text, onClose }: Props) {
  const { dimension } = useDimension();

  const handleCancel = useCallback(() => {
    onClose?.();
  }, []);

  const handleSettings = useCallback(() => {
    handleCancel();

    if (Platform.OS === 'ios') {
      Linking.openURL(`app-settings://${PACKAGE_NAME}`);
    } else {
      Linking.openSettings();
    }
  }, []);

  return (
    <Modal
      isVisible={isVisible}
      style={style.modal}
      statusBarTranslucent={true}
      deviceWidth={dimension.width}
      deviceHeight={dimension.height + StatusBar.currentHeight}
      animationIn="slideInUp"
      animationInTiming={200}
      animationOut="slideOutDown"
      animationOutTiming={200}
      useNativeDriver={true}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <View style={style.container}>
        <Text style={[font.BODY3_SB, style.titleText]}>Permission Request</Text>
        <Text style={[font.BODY1_R, style.contentText1]}>
          {text}{' '}
          <Text style={[font.BODY1_B, style.contentText2]}>
            "Settings {'>'} Apps and Permissions {'>'} App Management"
          </Text>
        </Text>
        <View style={style.buttonWrap}>
          <Button style={style.button} onPress={handleCancel}>
            <Text style={[font.BODY1_SB, style.buttonText]}>Cancel</Text>
          </Button>
          <Button style={style.button} onPress={handleSettings}>
            <Text style={[font.BODY1_SB, style.buttonText]}>Settings</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  text: string;
  onClose?: () => void;
}
