/**
 * @format
 */

import { AppRegistry } from 'react-native';

import messaging from '@react-native-firebase/messaging';

import App from './App';

import { name as appName } from './app.json';

/*
 * 백그라운드 푸시 메시지 이벤트 등록
 */
messaging().setBackgroundMessageHandler(async (message) => {});

AppRegistry.registerComponent(appName, () => App);
