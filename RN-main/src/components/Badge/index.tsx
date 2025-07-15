import { Image, View } from "react-native";
import { style } from "./style";
import { Text } from "~/components/Text";
export default function Badge() {
    return (
        <View style={style.badgeContainer}>
            <Image source={require('~/assets/images/badge.png')} style={style.badge} />
            <Text>둘레길 왕</Text>
        </View>
    )
}