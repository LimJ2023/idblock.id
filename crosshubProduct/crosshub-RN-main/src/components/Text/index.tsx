import React from 'react';

import { Text as ReactNativeText, TextProps, TextStyle } from 'react-native';

import style from './style';

interface Props {
  style?: TextStyle;
}

export function Text(props: Props & TextProps) {
  const propsStyle = props.style || {};
  delete props.style;

  return <ReactNativeText allowFontScaling={false} {...props} style={[style.text, propsStyle]} />;
}
