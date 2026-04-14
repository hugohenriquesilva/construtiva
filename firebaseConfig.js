import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAGUVb4jbRHLcd0fyWEiKIfWuH8Jjbrd1E",
  authDomain: "construtiva-c292f.firebaseapp.com",
  projectId: "construtiva-c292f",
  storageBucket: "construtiva-c292f.firebasestorage.app",
  messagingSenderId: "980472634910",
  appId: "1:980472634910:web:694e2fd530ba16a217180f",
  measurementId: "G-M02LYKY5N4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { auth, app };