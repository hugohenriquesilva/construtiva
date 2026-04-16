import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAGUVb4jbRHLcd0fyWEiKIfWuH8Jjbrd1E",
  authDomain: "construtiva-c292f.firebaseapp.com",
  projectId: "construtiva-c292f",
  storageBucket: "construtiva-c292f.firebasestorage.app",
  messagingSenderId: "980472634910",
  appId: "1:980472634910:web:694e2fd530ba16a217180f",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;

if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

export const auth = authInstance;
export { app };