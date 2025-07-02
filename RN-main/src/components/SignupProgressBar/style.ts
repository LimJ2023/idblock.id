import { StyleSheet } from 'react-native';
import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLOR.WHITE,
  },

  // 진행률 바 스타일
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLOR.GRAY_200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLOR.PRI_1_500,
    borderRadius: 4,
  },
  percentageText: {
    marginLeft: 12,
    color: COLOR.PRI_1_500,
    fontWeight: '600',
  },

  // 단계 표시 스타일
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: COLOR.PRI_1_500,
  },
  stepCircleCurrent: {
    backgroundColor: COLOR.PRI_2_500,
    borderWidth: 2,
    borderColor: COLOR.PRI_1_500,
  },
  stepCirclePending: {
    backgroundColor: COLOR.GRAY_200,
  },
  stepNumberCompleted: {
    color: COLOR.WHITE,
    fontWeight: '600',
  },
  stepNumberCurrent: {
    color: COLOR.PRI_1_500,
    fontWeight: '600',
  },
  stepNumberPending: {
    color: COLOR.GRAY_500,
    fontWeight: '400',
  },
  stepNameCompleted: {
    color: COLOR.PRI_1_500,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepNameCurrent: {
    color: COLOR.PRI_1_500,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepNamePending: {
    color: COLOR.GRAY_500,
    fontWeight: '400',
    textAlign: 'center',
  },

  // 현재 단계 정보 스타일
  currentStepContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLOR.GRAY_200,
  },
  currentStepLabel: {
    color: COLOR.GRAY_600,
    marginBottom: 4,
  },
  currentStepName: {
    color: COLOR.PRI_1_500,
  },

  // 간단한 진행률 바 스타일
  simpleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  simpleProgressBarBackground: {
    height: 4,
    backgroundColor: COLOR.GRAY_200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  simpleProgressBarFill: {
    height: '100%',
    backgroundColor: COLOR.PRI_1_500,
    borderRadius: 2,
  },

  // 단계 표시 점 스타일
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLOR.GRAY_300,
  },
  stepIndicatorDotCompleted: {
    backgroundColor: COLOR.PRI_1_500,
  },
  stepIndicatorDotCurrent: {
    backgroundColor: COLOR.PRI_2_500,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepIndicatorLine: {
    width: 24,
    height: 2,
    backgroundColor: COLOR.GRAY_200,
    marginHorizontal: 4,
  },
  stepIndicatorLineCompleted: {
    backgroundColor: COLOR.PRI_1_500,
  },
}); 