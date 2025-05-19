import { StyleSheet } from 'react-native';
import { font } from '~/style';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  body: {
    flex: 1,
    backgroundColor: COLOR.WHITE,
  },
  alarmList: {
    flex: 1,
  },
  alarmListContainer: {
    paddingBottom: 20,
  },
  alarmItem: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  alarmInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmInfoText: {
    color: COLOR.PRI_2_300,
  },
  alarmInfoSeparator: {
    width: 1,
    height: font.CAPTION1_M.lineHeight,
    borderLeftWidth: 1,
    borderLeftColor: '#E8E8E8',
    marginHorizontal: 5,
  },
  alarmItemTitle: {
    marginTop: 5,
    color: COLOR.BLACK,
  },
  alarmItemDescription: {
    marginTop: 3,
    color: COLOR.GRAY_700,
  },
});
