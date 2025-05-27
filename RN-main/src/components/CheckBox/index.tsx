import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { View, ViewStyle } from 'react-native';

import { Button } from '~/components/Button';

import style from './style';
import { COLOR } from '~/utils/guide';
import FastImage from '@d11/react-native-fast-image';

export const CheckBox = memo(function ({ disabled = false, initChecked = false, rightWrapStyle, rightChild, onChecked }: Props) {
  const [isChecked, setIsChecked] = useState<boolean>(initChecked);

  useEffect(() => {
    setIsChecked(initChecked);
  }, [initChecked]);

  const isCheckedRef = useRef<boolean>();

  if (isCheckedRef.current !== isChecked) {
    isCheckedRef.current = isChecked;
  }

  const handleButton = useCallback(() => {
    onChecked?.(!isCheckedRef.current);
    setIsChecked(!isCheckedRef.current);
  }, []);

  return (
    <Button style={style.container} onPress={handleButton} disabled={disabled}>
      <View style={[style.checkContainer, isChecked && { backgroundColor: COLOR.PRI_1_500, borderColor: COLOR.PRI_1_500 }]}>
        <FastImage
          source={require('~/assets/images/check-icon.png')}
          style={{
            width: 10,
            height: 8,
          }}
          resizeMode="contain"
        />
      </View>
      <View style={[style.rightWrap, rightWrapStyle]}>{rightChild}</View>
    </Button>
  );
});

interface Props {
  disabled?: boolean;
  initChecked?: boolean;
  rightWrapStyle?: ViewStyle;
  rightChild?: JSX.Element;
  onChecked?: (isChecked: boolean) => void;
}
