import { Image, View } from "react-native";
import { Text } from "~/components/Text";
import { useProfile } from "~/zustands/user";
import style from './style';    
import { Header } from "~/components/Header";
import { font } from "~/style";

export default function MyProfile() {

    const { profile } = useProfile();
    console.log('profile', profile);

    return (
        <View style={style.container}>
            <Header title="My Profile" />
            <View style={style.body}>
                <View style={style.profileContainer}>
                    <Image source={{ uri: profile.profileImage }} style={style.profileImage} />
                    <View>
                        <Text style={style.name}>{profile.name}</Text>
                        <Text style={ font.BODY1_M}>Edit Profile</Text>
                    </View>
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>Customer Support</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>Announcement</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>Change Password</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>Delete Account</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>Terms of Service</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>App Information</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>
                <View style={ style.profileContentList}>
                    <Text style={style.profileContentListText}>App Version</Text>
                    <Image source={require('~/assets/images/arrow.right.gray.png')} style={style.profileContentListArrow} />
                </View>

            </View>
        </View>
    )
}