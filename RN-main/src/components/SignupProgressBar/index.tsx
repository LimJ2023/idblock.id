import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { useSignupProgress, useSignupProgressData, SignupStep } from '~/zustands/signup';
import { font } from '~/style';
import { COLOR } from '~/utils/guide';
import style from './style';

interface SignupProgressBarProps {
  showStepName?: boolean;
  showPercentage?: boolean;
  style?: any;
}

const stepNames: Record<SignupStep, string> = {
  [SignupStep.EMAIL]: '이메일 인증',
  [SignupStep.TERMS]: '약관 동의',
  [SignupStep.FORM]: '정보 입력',
  [SignupStep.PASSPORT]: '여권 인증',
  [SignupStep.FACE]: '얼굴 인증',
  [SignupStep.RESULT]: '가입 완료',
};

export const SignupProgressBar = memo<SignupProgressBarProps>(function ({
  showStepName = true,
  showPercentage = true,
  style: customStyle,
}) {
  const { progress, currentStep } = useSignupProgress();
  const progressData = useSignupProgressData();

  const getStepStatus = (step: SignupStep) => {
    if (progressData.completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <View style={[style.container, customStyle]}>
      {/* 진행률 바 */}
      <View style={style.progressBarContainer}>
        <View style={style.progressBarBackground}>
          <View 
            style={[
              style.progressBarFill,
              { width: `${progress}%` }
            ]} 
          />
        </View>
                 {showPercentage && (
           <Text style={[font.CAPTION1_M, style.percentageText]}>
             {Math.round(progress)}%
           </Text>
         )}
      </View>

      {/* 단계 표시 */}
      <View style={style.stepsContainer}>
        {Object.values(SignupStep).map((step, index) => {
          const status = getStepStatus(step);
          return (
            <View key={step} style={style.stepItem}>
              <View style={[
                style.stepCircle,
                style[`stepCircle${status.charAt(0).toUpperCase() + status.slice(1)}`]
              ]}>
                <Text style={[
                  font.CAPTION2,
                  style[`stepNumber${status.charAt(0).toUpperCase() + status.slice(1)}`]
                ]}>
                  {status === 'completed' ? '✓' : index + 1}
                </Text>
              </View>
              {showStepName && (
                <Text style={[
                  font.CAPTION2,
                  style[`stepName${status.charAt(0).toUpperCase() + status.slice(1)}`]
                ]}>
                  {stepNames[step]}
                </Text>
              )}
            </View>
          );
        })}
      </View>

             {/* 현재 단계 정보 */}
       {showStepName && (
         <View style={style.currentStepContainer}>
           <Text style={[font.BODY3_SB, style.currentStepLabel]}>
             현재 단계
           </Text>
           <Text style={[font.BODY2_M, style.currentStepName]}>
             {stepNames[currentStep]}
           </Text>
         </View>
       )}
    </View>
  );
});

// 간단한 진행률만 표시하는 컴포넌트
export const SimpleProgressBar = memo<{ style?: any }>(function ({ style: customStyle }) {
  const { progress } = useSignupProgress();

  return (
    <View style={[style.simpleContainer, customStyle]}>
      <View style={style.simpleProgressBarBackground}>
        <View 
          style={[
            style.simpleProgressBarFill,
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </View>
  );
});

// 단계 표시만 하는 컴포넌트
export const StepIndicator = memo<{ style?: any }>(function ({ style: customStyle }) {
  const progressData = useSignupProgressData();

  return (
    <View style={[style.stepIndicatorContainer, customStyle]}>
      {Object.values(SignupStep).map((step, index) => {
        const isCompleted = progressData.completedSteps.includes(step);
        const isCurrent = step === progressData.currentStep;
        
        return (
          <View key={step} style={style.stepIndicatorItem}>
            <View style={[
              style.stepIndicatorDot,
              isCompleted && style.stepIndicatorDotCompleted,
              isCurrent && style.stepIndicatorDotCurrent,
            ]} />
            {index < Object.values(SignupStep).length - 1 && (
              <View style={[
                style.stepIndicatorLine,
                isCompleted && style.stepIndicatorLineCompleted,
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
}); 