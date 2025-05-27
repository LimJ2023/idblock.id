import React, { memo, useEffect, useMemo, useRef } from 'react';

import { View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';

import { Text } from '~/components/Text';

import { Dimension, useDimension } from '~/zustands/app';

import { STATIC_IMAGE } from '~/utils/constant';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

export const CameraDecorator = memo(function ({ isVisible, isActivated }: Props) {
  const { dimension } = useDimension();

  const prevDimension = useRef<Dimension>();

  const container = useRef<View>();
  const containerHeight = useRef<number>();
  const cameraFilterVerticalHeight1 = useRef<number>();
  const cameraFilterVerticalHeight2 = useRef<number>();
  const cameraFilterHorizontalHeight = useRef<number>();

  const borderColor = useMemo(() => (isActivated ? '#15E858' : COLOR.WHITE), [isActivated]);

  useEffect(() => {
    if (dimension.width !== prevDimension.current?.width) {
      containerHeight.current = undefined;

      container.current?.forceUpdate?.();
    }
  }, [dimension]);

  useEffect(() => {
    if (!isVisible) {
      containerHeight.current = undefined;
      cameraFilterVerticalHeight1.current = undefined;
      cameraFilterVerticalHeight2.current = undefined;
      cameraFilterHorizontalHeight.current = undefined;
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <View
      ref={container}
      style={[style.container, { height: containerHeight.current || '100%' }]}
      onLayout={(event) => {
        if (!containerHeight.current) {
          const height = Math.ceil(event.nativeEvent.layout.height);
          const _containerHeight = height;

          cameraFilterVerticalHeight1.current = Math.ceil(_containerHeight * 0.2);
          cameraFilterVerticalHeight2.current = Math.ceil(_containerHeight * 0.3);
          cameraFilterHorizontalHeight.current = Math.ceil(_containerHeight * 0.5);

          containerHeight.current =
            cameraFilterVerticalHeight1.current + cameraFilterVerticalHeight2.current + cameraFilterHorizontalHeight.current;
        }
      }}>
      <View style={style.cameraFilter}>
        <View style={[style.cameraFilterVertical, { height: cameraFilterVerticalHeight1.current || '20%' }]} />
        <View style={[style.cameraFilterHorizontalWrap, { height: cameraFilterHorizontalHeight.current || '50%' }]}>
          <View style={style.cameraFilterHorizontal} />
          <View style={style.cameraFilterHorizontalCenter}>
            <View style={[style.cameraFilterBorderTopLeft, { borderTopColor: borderColor, borderLeftColor: borderColor }]} />
            <View style={[style.cameraFilterBorderTopRight, { borderTopColor: borderColor, borderRightColor: borderColor }]} />
            <View
              style={[
                style.cameraFilterBorderBottomRight,
                {
                  borderBottomColor: borderColor,
                  borderRightColor: borderColor,
                },
              ]}
            />
            <View style={[style.cameraFilterBorderBottomLeft, { borderBottomColor: borderColor, borderLeftColor: borderColor }]} />
            <View style={style.cameraFilterCenterWrap}>
              <FastImage source={isActivated ? STATIC_IMAGE.PLUS_GREEN : STATIC_IMAGE.PLUS_WHITE} style={style.cameraFilterCenterImage} />
            </View>
          </View>
          <View style={style.cameraFilterHorizontal} />
        </View>
        <View style={[style.cameraFilterVertical, { height: cameraFilterVerticalHeight2.current || '30%' }]} />
      </View>
      <Text style={[font.BODY1_M, style.guideText]}>Please take a photo according{'\n'}to the specifications provided</Text>
    </View>
  );
});

interface Props {
  isVisible: boolean;
  isActivated: boolean;
}
