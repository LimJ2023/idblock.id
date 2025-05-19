import { StyleSheet } from 'react-native';
import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 5,
    backgroundColor: COLOR.WHITE,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: COLOR.UI_COLOR_900,
  },
  contentText1: {
    marginTop: 15,
    textAlign: 'center',
    color: COLOR.UI_COLOR_900,
  },
  contentText2: {
    color: COLOR.UI_COLOR_900,
  },
  buttonWrap: {
    marginTop: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#5A52C5',
  },
});
