import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  body: {
    flexGrow: 1,
    backgroundColor: COLOR.WHITE,
  },
  bodyContent: {
    flex: 1,
  },
  formWrap: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  labelText: {
    color: COLOR.PRI_2_700,
  },
  inputDisabledContainer: {
    backgroundColor: '#F7F7F7',
  },
  inputDisabledText: {
    color: '#555555',
  },
  inputWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  selectBox: {
    elevation: 0,
    marginVertical: 3,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  selectButton: {
    marginTop: 10,
    marginBottom: 35,
    width: '100%',
    height: 56,
    backgroundColor: COLOR.GRAY_100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  selectButtonText: {
    color: COLOR.UI_COLOR_800,
  },
  selectButtonImage: {
    width: 24,
    height: 24,
  },
  selectItem: {
    width: '100%',
    height: 40,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  selectItemText: {
    color: COLOR.GRAY_800,
  },
  messageText: {
    color: COLOR.ERROR,
    marginLeft: 6,
    marginTop: -30,
    marginBottom: 35,
  },
  nextButtonWrap: {
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLOR.PRI_1_500,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLOR.WHITE,
  },
});
