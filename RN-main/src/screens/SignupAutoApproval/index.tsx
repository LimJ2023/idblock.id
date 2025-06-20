import React, { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { Button } from '~/components/Button';
import { Text } from "~/components/Text";
import { STATIC_IMAGE } from '~/utils/constant';
import { font } from '~/style';
import style from "./style";

const SignupAutoApproval = memo(function () {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const { bottom } = useSafeAreaInsets();

    const handleComplete = useCallback(() => {
        navigation.popToTop();
    }, [navigation]);

    return (
        <View style={[style.container, { paddingBottom: bottom }]}>
            <View style={style.body}>
                <View style={style.bodyContent}>
                    <View style={style.contentWrap}>
                        <Text style={[font.SUBTITLE1, style.finishTitleText]}>자동승인 완료</Text>
                        <FastImage source={STATIC_IMAGE.SUCCESS_GREEN} style={style.finishImage} resizeMode="contain" />
                        <Text style={[font.BODY1_SB, style.finishContentText]}>
                            계정이 자동으로 승인되었습니다.{'\n'}
                            이제 IDBlock의 모든 서비스를{'\n'}
                            이용하실 수 있습니다.
                        </Text>
                    </View>
                </View>
                <View style={style.nextButtonWrap}>
                    <Button style={style.nextButton} onPress={handleComplete}>
                        <Text style={[font.BODY3_SB, style.nextButtonText]}>시작하기</Text>
                    </Button>
                </View>
            </View>
        </View>
    );
});

export default SignupAutoApproval;