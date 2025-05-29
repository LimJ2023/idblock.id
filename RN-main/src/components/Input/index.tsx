import React, { ForwardedRef, forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { View, TextInput, TextInputProps, Image, StyleProp, TextStyle, ViewStyle, DimensionValue, ColorValue } from 'react-native';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { COLOR } from '~/utils/guide';
import { font } from '~/style';

import style from './style';

function InputComp(props: TextInputProps & Props, ref: ForwardedRef<InputRef> | undefined) {
  const inputRef = useRef<TextInput>();

  const [isVisiblePassword, setIsVisiblePassword] = useState<boolean>(false);
  const [isExistValue, setIsExistValue] = useState<boolean>(!!props.value);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const inputWidth: DimensionValue = isExistValue && isFocus ? (props?.secureTextEntry ? '78%' : '85%') : '100%';

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const _containerStyle = useMemo(
    () => [
      style.container,
      {
        borderColor:
          props.maximumCount && (props.value?.length || 0) > props.maximumCount
            ? COLOR.RED
            : props.message?.text
            ? props.message.color || COLOR.GRAY_600
            : isFocus
            ? COLOR.PURPLE
            : style.container.borderColor,
      },
      props?.containerStyle || {},
      { marginTop: 0, marginBottom: 0 },
    ],
    [props.containerStyle, props.message, props.value, isFocus],
  );

  const _inputStyle: StyleProp<TextStyle> = useMemo(
    () => [font.INPUT1, style.input, { width: inputWidth, lineHeight: font.INPUT1.fontSize * 1.2 }, props?.style || {}],
    [inputWidth, props.style],
  );

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
  }));

  useEffect(() => {
    setIsExistValue(!!props.value);
  }, [props.value]);

  return (
    <View style={[style.wrapper, props.wrapperStyle]}>
      <Button style={_containerStyle} onPress={handlePress} disabled={props.disabled}>
        <TextInput
          ref={inputRef}
          allowFontScaling={false}
          keyboardType="default"
          textContentType="sublocality"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          {...props}
          secureTextEntry={props.secureTextEntry && !isVisiblePassword}
          style={_inputStyle}
          placeholderTextColor={props?.placeholderTextColor || COLOR.PRI_2_300}
          scrollEnabled={props?.scrollEnabled || false}
          editable={!props.disabled}
          onChangeText={(text: string) => {
            setIsExistValue(!!text);

            if (props.onChangeText) {
              props.onChangeText(text);
            }
          }}
          onFocus={(e) => {
            setIsFocus(true);

            if (props.onFocus) {
              props.onFocus(e);
            }
          }}
          onBlur={(e) => {
            setIsFocus(false);

            if (props.onBlur) {
              props.onBlur(e);
            }
          }}
        />
        {isExistValue && isFocus ? (
          <>
            {props?.secureTextEntry ? (
              <Button style={style.buttonEye} onPress={() => setIsVisiblePassword(!isVisiblePassword)}>
                <Image
                  style={style.imageButtonEye}
                  source={isVisiblePassword ? require('./assets/eye-invisible.png') : require('./assets/eye-visible.png')}
                  resizeMode="contain"
                />
              </Button>
            ) : null}
            {!props?.removeButton && (
              <Button
                style={[style.buttonClose]}
                onPress={() => {
                  setIsExistValue(false);

                  if (props.onChangeText) {
                    props.onChangeText('');
                  }
                }}>
                <Image style={style.imageButtonClose} source={require('./assets/cancel.png')} resizeMode="contain" />
              </Button>
            )}
          </>
        ) : null}
      </Button>
      {props.message?.text && (
        <Text style={[font.CAPTION1_M, style.messageText, { color: props.message.color || COLOR.GRAY_600 }]}>{props.message.text}</Text>
      )}
      {!!props.maximumCount && (
        <Text
          style={[
            font.CAPTION1_M,
            style.countText,
            { color: (props.value?.length || 0) > props.maximumCount ? COLOR.RED : style.countText.color },
          ]}>
          {props?.value?.length || 0}/{props.maximumCount}
        </Text>
      )}
    </View>
  );
}

export const Input = memo(forwardRef(InputComp));

export interface InputRef {
  focus: () => void;
}

export interface InputMessage {
  text: string;
  color?: ColorValue;
}

interface Props {
  disabled?: boolean;
  maximumCount?: number;
  wrapperStyle?: {
    marginTop?: DimensionValue;
    marginBottom?: DimensionValue;
  };
  containerStyle?: ViewStyle | ViewStyle[];
  removeButton?: boolean;
  message?: InputMessage;
}
