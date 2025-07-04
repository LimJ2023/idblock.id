import React, { memo, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '~/components/Text';
import { Header } from '~/components/Header';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { MENU } from '~/utils/constant';
import { StackNavigationProp } from '@react-navigation/stack';

export const StampList = memo(function () {
    const { bottom } = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<any>>();

    const navigateBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    const navigatePaymentMethodSelection = useCallback(() => {
        navigation.push(MENU.STACK.SCREEN.PAYMENT_METHOD_SELECTION);
    }, [navigation]);

    const gesture = Gesture.Pan().onEnd((e) => {
        if (e.translationX > 100) {
            runOnJS(navigateBack)();
        } else if (e.translationX < -100) {
            runOnJS(navigatePaymentMethodSelection)();
        }
    })
    return (
        <GestureDetector gesture={gesture}>
        <View style={{ flex: 1, backgroundColor: COLOR.WHITE }}>
            <Header title="스탬프 리스트" />
            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ 
                    padding: 20,
                    paddingBottom: bottom + 20 
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    paddingVertical: 50
                }}>
                    <Text style={[font.SUBTITLE1_SB, { color: COLOR.BLACK, marginBottom: 10 }]}>
                        스탬프 리스트
                    </Text>
                    <Text style={[font.BODY2_R, { color: COLOR.UI_COLOR_400 }]}>
                        여기에 스탬프 목록이 표시됩니다.
                    </Text>
                </View>
            </ScrollView>
        </View>
        </GestureDetector>
    );
});