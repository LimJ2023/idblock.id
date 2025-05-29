import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { StatusBar, View } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Modal from 'react-native-modal';
import dayjs from 'dayjs';

import { Button } from '~/components/Button';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { font, globalStyle } from '~/style';
import { COLOR } from '~/utils/guide';

import style from './style';

export const ModalCalendar = memo(function ({ isVisible, initValue, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<string>();

  const today = useRef<string>(dayjs(new Date()).format('YYYY-MM-DD')).current;

  const { dimension } = useDimension();

  const initValueRef = useRef<string>();

  if (initValueRef.current !== initValue) {
    initValueRef.current = initValue;
  }

  const selectedRef = useRef<string>();

  if (selectedRef.current !== selected) {
    selectedRef.current = selected;
  }

  const handleSubmit = useCallback(() => {
    onClose();
    onSubmit(selectedRef.current);
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (initValueRef.current) {
        setSelected(initValueRef.current);
      }
    } else {
      setSelected(undefined);
    }
  }, [isVisible]);

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
      <View style={[globalStyle.modalHeader, style.datePickerWrap, { height: dimension.height * 0.67 - getBottomSpace() }]}>
        <Calendar
          onDayPress={(date) => setSelected(dayjs(new Date(date.timestamp)).format('YYYY-MM-DD'))}
          style={style.datePicker}
          minDate={today}
          current={today}
          firstDay={1}
          markedDates={
            selected
              ? {
                  [selected]: { selected: true },
                }
              : undefined
          }
          theme={{
            backgroundColor: COLOR.WHITE,
            calendarBackground: COLOR.WHITE,
            textSectionTitleColor: COLOR.GRAY_800,
            selectedDayBackgroundColor: COLOR.PRI_1_500,
            selectedDayTextColor: COLOR.WHITE,
            todayTextColor: COLOR.PRI_1_500,
            dayTextColor: COLOR.GRAY_800,
            textDisabledColor: COLOR.UI_COLOR_200,
            selectedDotColor: COLOR.PRI_1_500,
            dotColor: COLOR.PRI_1_500,
          }}
        />
        <View style={style.buttonWrap}>
          <Button
            style={[style.button, { backgroundColor: selected ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
            disabled={!selected}
            onPress={handleSubmit}>
            <Text style={[font.BODY3_SB, style.buttonText]}>Choose</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
});

interface Props {
  isVisible: boolean;
  initValue?: string;
  onClose?: () => void;
  onSubmit?: (selected: string) => void;
}

LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'kr';
