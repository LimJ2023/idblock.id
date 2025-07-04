import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import { Header } from '~/components/Header';
import { Text } from '~/components/Text';
import { Button } from '~/components/Button';
import style from './style';
import { useNavigation } from '@react-navigation/native';
import { Gesture, GestureDetector} from "react-native-gesture-handler"
import { runOnJS } from 'react-native-reanimated';
import { font } from '~/style';

const PAYMENT_METHODS = [
  { key: 'credit', label: 'Credit Card' },
  { key: 'paypal', label: 'PayPal', imageUrl: require('~/assets/images/payIcon/paypal.png') },
  { key: 'stripe', label: 'Stripe', imageUrl: require('~/assets/images/payIcon/stripe.png') },
  { key: 'toss', label: 'Toss Payments', imageUrl: require('~/assets/images/payIcon/toss.png') },
  { key: 'kakaopay', label: 'KakaoPay', imageUrl: require('~/assets/images/payIcon/kakao.png') },
];

const INSTALLMENTS = [
  'Installment',
  '2 months',
  '3 months',
  '6 months',
  '12 months',
];

export default function PaymentMethodSelection() {
  const [selected, setSelected] = useState('credit');
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(INSTALLMENTS[0]);
  const navigation = useNavigation();
  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const payCreditCard = useCallback(() => {
    console.log('payCreditCard');
  }, []);

  const gesture = Gesture.Pan().onEnd((e) => {
    if(e.translationX > 100) {
      runOnJS(navigateBack)();
    } else if(e.translationX < -100) {
      // 추후 화면 추가 예정
    }
  }).activeOffsetX([-20, 20]).failOffsetY([-20, 20]);

  return (
    <GestureDetector gesture={gesture}>
    <View style={style.container}>
      <Header title="Payment Method Selection"/>
      <View style={style.body}>
        <Text style={style.sectionTitle}>Payment Method</Text>
        {/* <Button style={style.creditCardButton} onPress={() => {}}>
          <Text style={style.methodLabel}>Credit Card</Text>
        </Button> */}
        <View style={style.methodList}>
          {PAYMENT_METHODS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[item.key === 'credit' ? style.creditCardButton : style.methodButton, selected === item.key && style.methodButtonSelected]}
              onPress={() => setSelected(item.key)}
              activeOpacity={0.8}
            >
              {item.key === 'credit' ? <Text style={style.creditCardButtonText}>{item.label}</Text> 
              : <Image source={item.imageUrl} style={style.methodImage} />}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={style.installmentDropdown}
          onPress={() => setInstallmentOpen((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={style.installmentValue}>{selectedInstallment}</Text>
          <Image style={style.installmentArrow} source={require('~/assets/images/arrow.down.black.png')}/>
        </TouchableOpacity>
        {installmentOpen && (
          <View style={style.installmentListWrap}>
            <FlatList
              data={INSTALLMENTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={style.installmentItem}
                  onPress={() => {
                    setSelectedInstallment(item);
                    setInstallmentOpen(false);
                  }}
                >
                  <Text style={style.installmentItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
      <View style={style.nextButtonWrap}>
          <Button style={style.nextButton} >
            <Text style={[font.BODY3_SB, style.nextButtonText]}>Proeed to Payment</Text>
          </Button>
        </View>
    </View>
    </GestureDetector>
  );
} 