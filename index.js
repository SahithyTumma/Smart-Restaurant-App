/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import './global.js';
// import PushNotification from "react-native-push-notification";
// import { Platform } from 'react-native';

// PushNotification.configure({
//     onRegister: function (token) {
//         console.log("TOKEN:", token);
//     },
//     onNotification: function (notification) {
//         console.log("NOTIFICATION:\n\n\n\n\n\n\n", notification);
//     },
//     permissions: {
//         alert: true,
//         badge: true,
//         sound: true,
//     },
//     popInitialNotification: true,
//     requestPermissions: Platform.OS === "ios",
// });

AppRegistry.registerComponent(appName, () => App);
