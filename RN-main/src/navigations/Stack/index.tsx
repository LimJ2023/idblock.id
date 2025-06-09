import React, { memo } from 'react';

import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { ResetFormPassword } from '~/screens/ResetFormPassword';
import { ResetFormResult } from '~/screens/ResetFormResult';
import { ResetFormEmail } from '~/screens/ResetFormEmail';
import { SignupPassport } from '~/screens/SignupPassport';
import { ResetFormCode } from '~/screens/ResetFormCode';
import { IdCardPending } from '~/screens/IdCardPending';
import { IdCardDenied } from '~/screens/IdCardDenied';
import { SignupResult } from '~/screens/SignupResult';
import { SignupSimpleResult } from '~/screens/SignupSimpleResult';
import { SignupEmail } from '~/screens/SignupEmail';
import { SignupFace } from '~/screens/SignupFace';
import { SignupForm } from '~/screens/SignupForm';
import { SignupTerm } from '~/screens/SignupTerm';
import { History } from '~/screens/History';
import { IdCard } from '~/screens/IdCard';
import { Signin } from '~/screens/Signin';
import { Alarm } from '~/screens/Alarm';
import { Main } from '~/screens/Main';
import { Qr } from '~/screens/Qr';

import { useAccessToken } from '~/zustands/app';

import { MENU } from '~/utils/constant';

const Stack = createStackNavigator();

export const StackNavigator = memo(function () {
  const { accessToken } = useAccessToken();

  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerShown: false,
        headerTitleAlign: 'center',
        freezeOnBlur: true,
      }}
      initialRouteName={accessToken ? MENU.STACK.SCREEN.MAIN : MENU.STACK.SCREEN.SIGNIN}>
      <Stack.Screen name={MENU.STACK.SCREEN.ALARM} component={Alarm} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.HISTORY} component={History} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name={MENU.STACK.SCREEN.ID_CARD_PENDING}
        component={IdCardPending}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.ID_CARD_DENIED}
        component={IdCardDenied}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name={MENU.STACK.SCREEN.ID_CARD} component={IdCard} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.MAIN} component={Main} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.QR} component={Qr} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name={MENU.STACK.SCREEN.RESET_FORM_CODE}
        component={ResetFormCode}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.RESET_FORM_EMAIL}
        component={ResetFormEmail}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.RESET_FORM_PASSWORD}
        component={ResetFormPassword}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.RESET_FORM_RESULT}
        component={ResetFormResult}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name={MENU.STACK.SCREEN.SIGNIN} component={Signin} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.SIGNUP_EMAIL} component={SignupEmail} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.SIGNUP_FACE} component={SignupFace} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name={MENU.STACK.SCREEN.SIGNUP_FORM} component={SignupForm} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name={MENU.STACK.SCREEN.SIGNUP_PASSPORT}
        component={SignupPassport}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.SIGNUP_RESULT}
        component={SignupResult}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={MENU.STACK.SCREEN.SIGNUP_SIMPLE_RESULT}
        component={SignupSimpleResult}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name={MENU.STACK.SCREEN.SIGNUP_TERM} component={SignupTerm} options={{ headerShown: false, gestureEnabled: false }} />
    </Stack.Navigator>
  );
});
