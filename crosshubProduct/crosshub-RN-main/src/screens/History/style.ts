import { StyleSheet } from 'react-native';

import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-screen-helper';

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
  list: {
    flex: 1,
  },
  emptyDataContainer: {
    width: '100%',
    alignItems: 'center',
  },
  emptyDataImage: {
    marginTop: 120,
    width: 80,
    height: 80,
  },
  emptyDataText: {
    marginTop: 20,
    color: COLOR.UI_COLOR_400,
  },
  listContainer: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    width: '33.33%',
    marginBottom: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageWrap: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 80,
  },
  itemNameText: {
    marginBottom: 10,
    textAlign: 'center',
    color: COLOR.GRAY_900,
  },
  itemDateText: {
    textAlign: 'center',
    color: COLOR.GRAY_700,
  },
  selectedItem: {
    zIndex: 1,
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    backgroundColor: 'rgba(254, 79, 24, 0.5)',
    borderWidth: 3,
    borderColor: COLOR.PRI_1_500,
  },
  selectedItemImage: {
    width: 32,
    height: 32,
  },
  writedReviewImage: {
    zIndex: 2,
    position: 'absolute',
    right: 0,
    top: 2,
    width: 24,
    height: 24,
  },
  writeButtonWrap: {
    position: 'absolute',
    paddingTop: 50,
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
  },
  writeButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.PRI_1_500,
  },
  writeButtonText: {
    color: COLOR.WHITE,
  },
  writeModal: {
    flex: 1,
    margin: 0,
    paddingHorizontal: 20,
    paddingVertical: getStatusBarHeight() + getBottomSpace() + 50,
  },
  writeModalContainer: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLOR.WHITE,
    overflow: 'hidden',
  },
  writeModalScroll: {
    flex: 1,
    width: '100%',
  },
  writeModalScrollContainer: {
    alignItems: 'center',
  },
  writeModalTitleText: {
    marginTop: 40,
    color: COLOR.GRAY_900,
  },
  writeModalImage: {
    width: 110,
    height: 110,
    borderRadius: 110,
    marginTop: 30,
  },
  writeModalNameText: {
    marginTop: 25,
    textAlign: 'center',
    color: COLOR.GRAY_900,
  },
  writeModalDateText: {
    marginTop: 20,
    color: COLOR.GRAY_700,
  },
  writeModalDescriptionText: {
    marginTop: 17,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: COLOR.GRAY_900,
  },
  writeModalInputWrap: {
    marginTop: 22,
    width: '100%',
    paddingHorizontal: 20,
  },
  writeModalInputLabelText: {
    color: COLOR.GRAY_900,
  },
  writeModalInputWrapper: {
    marginTop: 10,
  },
  writeModalInputContainer: {
    justifyContent: 'flex-start',
    paddingVertical: 5,
    height: 120,
  },
  writeModalInputCount: {
    color: COLOR.GRAY_800,
  },
  writeModalInputCountHighlight: {
    position: 'absolute',
    right: 26,
    bottom: -10,
    color: COLOR.PRI_1_500,
  },
  writeModalButtonWrap: {
    marginTop: 25,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  writeModalCloseButton: {
    width: '49%',
    height: 56,
    backgroundColor: COLOR.PRI_3_500,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  writeModalCloseButtonText: {
    color: COLOR.PRI_2_500,
  },
  writeModalConfirmButton: {
    width: '49%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
