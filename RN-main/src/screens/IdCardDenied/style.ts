import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAEFE7',
  },
  containerImageBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 329,
    height: 362,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  idcardPendingCard: {
    marginTop: 20,
  },
  profileWrap: {
    width: 280,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  profileTitleText: {
    textAlign: 'center',
    color: COLOR.UI_COLOR_900,
  },
  profileTitleCaptionText: {
    marginTop: 8,
    textAlign: 'center',
    color: COLOR.PRI_2_300,
  },
  faceImage: {
    marginTop: 30,
    borderRadius: 11,
    width: 132,
    height: 180,
  },
  nameText: {
    marginTop: 25,
    marginBottom: 7,
    textAlign: 'center',
    color: COLOR.UI_COLOR_800,
  },
  honoraryWrap: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: COLOR.PRI_1_500,
    borderRadius: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  honoraryText: {
    color: COLOR.PRI_1_500,
  },
  deniedGuideText: {
    marginTop: 30,
    textAlign: 'center',
    color: COLOR.UI_COLOR_800,
  },
  deniedReasonWrap: {
    marginTop: 25,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 221, 204, 0.4)',
  },
  deniedReasonTitle: {
    color: COLOR.UI_COLOR_800,
    marginBottom: 12,
  },
  guideContentTextWrap: {
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guideContentHead: {
    marginTop: -4,
    marginRight: 5,
    color: COLOR.PRI_2_500,
  },
  guideContentText: {
    color: COLOR.UI_COLOR_300,
    lineHeight: 12 * 1.5,
  },
  guideReasonTail: {
    color: COLOR.UI_COLOR_300,
  },
  bottomButtonWrap: {
    marginTop: 35,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bottomButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: COLOR.PRI_1_500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: COLOR.WHITE,
  },
});
