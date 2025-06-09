import { memo, useCallback, useRef } from "react"
import {  View } from "react-native"
import { font } from "~/style"
import { Text } from "~/components/Text"
import { Button } from "~/components/Button"
import FastImage from "react-native-fast-image"
import style from "./style"
import { MENU, STATIC_IMAGE } from "~/utils/constant"
import { useNavigation } from '@react-navigation/native';
import {  StackNavigationProp } from "@react-navigation/stack"
import { getNextScreenInFlow, SIGNUP_FLOW } from "~/utils/screenFlow"

export const SignupSimpleResult = memo(function ({ route }: Params) {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const { uuid, email, pw } = route.params;



    const handleHome = useCallback(() => {
        navigation.popToTop();
    },[])

    const handleVerify = useCallback(() => {

        const nextScreen = getNextScreenInFlow(SIGNUP_FLOW, MENU.STACK.SCREEN.SIGNUP_SIMPLE_RESULT);
        
        if (nextScreen) {
            navigation.push(nextScreen, {
                uuid: uuid,
                email: email,
                pw: pw,
            })
        } else {
            console.warn('No next screen found in signup flow');
        }
    },[])
    return (
        <View style={style.container}>
            <View style={style.body}>
                <View style={style.bodyContent}>
                    <View style={style.contentWrap}>
                        <Text style={[font.SUBTITLE1, style.finishTitleText]}>Welcome to IDBlock</Text>
                        <FastImage source={STATIC_IMAGE.SUCCESS_BLACK} style={style.finishImage} resizeMode="contain" />
                        <Text style={[font.BODY1_SB, style.finishContentText]}>
                            Your account has been created successfully.
                        </Text>
                    </View>
                </View>
                <View style={style.nextButtonWrap}>
                    <Button
                        style={style.nextButton}
                        onPress={handleHome}>
                        <Text style={[font.BODY3_SB, style.nextButtonText]}>
                            Not now
                        </Text>
                    </Button>
                    <Button
                        style={style.nextButton}
                        onPress={handleVerify}>
                        <Text style={[font.BODY3_SB, style.nextButtonText]}>
                            Verify Passport
                        </Text>
                    </Button>
                </View>
            </View>
        </View>
    )
})

interface Params {
    route: {
        params: NavigationParams;
    };
}

interface NavigationParams {
    uuid: string;
    email: string;
    pw: string;
}