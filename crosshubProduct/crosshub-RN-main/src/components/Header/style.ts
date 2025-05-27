import { StyleSheet } from 'react-native';
import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  headerLeftWrap: {
    width: '20%',
  },
  headerCenterWrap: {
    width: '60%',
  },
  hedaerRightWrap: {
    alignItems: 'flex-end',
    width: '20%',
  },
  headerBackButton: {
    marginLeft: -10,
  },
  headerBackButtonImage: {
    width: 32,
    height: 32,
  },
  headerTitleText: {
    textAlign: 'center',
    color: COLOR.BLACK,
  },
});
