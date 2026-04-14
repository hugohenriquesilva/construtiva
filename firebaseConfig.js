// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGUVb4jbRHLcd0fyWEiKIfWuH8Jjbrd1E",
  authDomain: "construtiva-c292f.firebaseapp.com",
  projectId: "construtiva-c292f",
  storageBucket: "construtiva-c292f.firebasestorage.app",
  messagingSenderId: "980472634910",
  appId: "1:980472634910:web:694e2fd530ba16a217180f",
  measurementId: "G-M02LYKY5N4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;