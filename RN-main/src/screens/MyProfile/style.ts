import { StyleSheet } from 'react-native';
import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: COLOR.WHITE,
    },
    body: {
        flex: 1,
        paddingTop: 32,
        // paddingHorizontal: 20,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: COLOR.UI_COLOR_800,
    },
    email: {
        fontSize: 16,
        marginBottom: 16,
        color: COLOR.UI_COLOR_800,
    },
    birthday: {
        fontSize: 16,
        marginBottom: 16,
        color: COLOR.UI_COLOR_800,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    profileContentList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLOR.GRAY_200,
        paddingHorizontal: 20,
    },

    profileContentListText: {
        color: COLOR.BLACK,
        fontSize: 18,
        fontWeight: 'bold'
    },
    profileContentListArrow: {
        width: 25,
        height: 25,
    }
})