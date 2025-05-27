import React, { memo, useCallback, useRef, useState } from 'react';

import { View, ViewStyle } from 'react-native';

import { Button } from '~/components/Button';

import style from './style';

export const Check = memo(function ({
  disabled = false,
  initChecked = false,
  leftWrapStyle,
  centerWrapStyle,
  rightWrapStyle,
  leftChild,
  centerChild,
  rightChild,
  onChecked,
}: Props) {
  const [isChecked, setIsChecked] = useState<boolean>(initChecked);

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
      <View style={[style.leftWrap, leftWrapStyle]}>{leftChild}</View>
      <View style={[style.centerWrap, centerWrapStyle]}>{centerChild}</View>
      <View style={[style.rightWrap, rightWrapStyle]}>{rightChild}</View>
    </Button>
  );
});

interface Props {
  disabled?: boolean;
  initChecked?: boolean;
  leftWrapStyle?: ViewStyle;
  centerWrapStyle?: ViewStyle;
  rightWrapStyle?: ViewStyle;
  leftChild?: JSX.Element;
  centerChild?: JSX.Element;
  rightChild?: JSX.Element;
  onChecked?: (isChecked: boolean) => void;
}
