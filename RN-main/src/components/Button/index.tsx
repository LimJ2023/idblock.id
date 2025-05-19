import React, { memo, useEffect, useRef, useState } from 'react';

import { Pressable, PressableProps } from 'react-native';

import debounce from 'lodash.debounce';

const defaultFunction = function () {};

export const Button = memo(function (props: Props) {
  const [debouncePress, setDebouncePress] = useState<Press>({
    onPress: () => {},
  });

  const propsRef = useRef<Props>();

  if (propsRef !== props) {
    propsRef.current = props;
  }

  useEffect(() => {
    if (props.onPress) {
      setDebouncePress({
        onPress: debounce(props.onPress || defaultFunction, props.duration || 300, {
          leading: true,
          trailing: false,
        }),
      });
    }
  }, [props?.onPress]);

  return (
    <Pressable {...props} onPress={debouncePress.onPress}>
      {props.children}
    </Pressable>
  );
});

interface Press {
  onPress: () => void;
}

interface Props extends PressableProps {
  duration?: number;
  onPress?: () => void;
}
