import { StyleSheet } from "react-native";
import { COLOR } from "~/utils/guide";

export const style = StyleSheet.create({
    badge: {
        width: 100,
        height: 100,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: COLOR.UI_COLOR_400,
    },
    badgeContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    }
})