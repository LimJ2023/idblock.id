import React, { memo, useCallback, useEffect, useState } from 'react';

import { FlatList, ListRenderItemInfo, View } from 'react-native';

import { Header } from '~/components/Header';
import { Text } from '~/components/Text';

import { useApiGetNotificationList } from '~/hooks/api.get.notification.list';

import { Notification } from '~/types/notification';
import { font } from '~/style';

import style from './style';

export const Alarm = memo(function () {
  const [list, setList] = useState<Notification[]>([]);

  const { apiGetNotificationList } = useApiGetNotificationList();

  const MemoizedAlarmItem = useCallback(({ item, index }: ListRenderItemInfo<Notification>) => {
    return (
      <View style={style.alarmItem}>
        <View style={style.alarmInfoWrap}>
          <Text style={[font.CAPTION1_M, style.alarmInfoText]}>{item.displayType}</Text>
          <View style={style.alarmInfoSeparator} />
          <Text style={[font.CAPTION1_M, style.alarmInfoText]}>{item.displayTime}</Text>
        </View>
        <Text style={[font.BODY1_SB, style.alarmItemTitle]}>{item.title}</Text>
        <Text style={[font.BODY2_R, style.alarmItemDescription]}>{item.content}</Text>
      </View>
    );
  }, []);

  const init = useCallback(async () => {
    const _list = await apiGetNotificationList();

    setList(_list);
  }, []);

  useEffect(() => {
    init();
  }, []);

  return (
    <View style={style.container}>
      <Header title="Notification" />
      <View style={style.body}>
        <FlatList
          showsVerticalScrollIndicator={false}
          style={style.alarmList}
          contentContainerStyle={style.alarmListContainer}
          data={list}
          renderItem={MemoizedAlarmItem}
        />
      </View>
    </View>
  );
});
