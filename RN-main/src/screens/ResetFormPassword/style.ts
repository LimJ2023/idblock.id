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
    paddingBottom: 20,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
  },
  formWrap: {
    width: '100%',
    marginTop: 110,
    paddingHorizontal: 20,
  },
  labelText: {
    color: COLOR.PRI_2_700,
  },
  inputWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  nextButtonWrap: {
    position: 'absolute',
    bottom: 40,
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
