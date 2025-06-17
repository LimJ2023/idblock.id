import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    width: '100%',
    backgroundColor: COLOR.WHITE,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  titleText: {
    textAlign: 'center',
    color: COLOR.BLACK,
    marginBottom: 12,
  },
  messageText: {
    textAlign: 'center',
    color: COLOR.GRAY_600,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLOR.GRAY_100,
    borderWidth: 1,
    borderColor: COLOR.GRAY_200,
  },
  cancelButtonText: {
    color: COLOR.GRAY_600,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLOR.PRI_1_500,
  },
  confirmButtonText: {
    color: COLOR.WHITE,
  },
}); 