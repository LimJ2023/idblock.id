import React, { memo, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../Text';
import { font } from '~/style';
import { COLOR } from '~/utils/guide';
import style from './style';

interface ProgressBarProps {
  isVisible: boolean;
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  currentStepText?: string;
}

export const ProgressBar = memo(function ProgressBar({
  isVisible,
  currentStep,
  totalSteps,
  stepLabels,
  currentStepText
}: ProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  useEffect(() => {
    const progress = currentStep / totalSteps;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  if (!isVisible) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[style.container, { opacity: fadeAnim }]}>
      <View style={style.content}>
                  <Text style={[font.BODY2_B, style.title]}>Processing...</Text>
        
        <View style={style.progressContainer}>
          <View style={style.progressBackground}>
            <Animated.View 
              style={[
                style.progressFill,
                { width: progressWidth }
              ]} 
            />
          </View>
          <Text style={[font.CAPTION1_R, style.progressText]}>
            {currentStep} / {totalSteps}
          </Text>
        </View>

        <View style={style.stepsContainer}>
          {stepLabels.map((label, index) => (
            <View key={index} style={style.stepItem}>
              <View style={[
                style.stepIndicator,
                {
                  backgroundColor: index < currentStep ? COLOR.PRI_1_500 : 
                                  index === currentStep ? COLOR.PRI_1_300 : COLOR.DISABLED
                }
              ]}>
                <Text style={[
                  font.CAPTION2,
                  {
                    color: index <= currentStep ? COLOR.WHITE : COLOR.PRI_3_600
                  }
                ]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[
                font.CAPTION1_R,
                style.stepLabel,
                {
                  color: index < currentStep ? COLOR.PRI_1_500 : 
                         index === currentStep ? COLOR.BLACK : COLOR.PRI_3_600
                }
              ]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {currentStepText && (
          <Text style={[font.BODY4_R, style.currentStepText]}>
            {currentStepText}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}); 