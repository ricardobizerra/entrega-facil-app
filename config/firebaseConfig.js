// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBV_4gOCJLdiWalNxypWOSLgcTVw4Y1bu8",
  authDomain: "entrega-facil-cbb50.firebaseapp.com",
  projectId: "entrega-facil-cbb50",
  storageBucket: "entrega-facil-cbb50.appspot.com",
  messagingSenderId: "586924511470",
  appId: "1:586924511470:web:998bca1c02a71aab7e23ff",
  measurementId: "G-0KCS4D7X24",
};

// Inicializa o Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializa o Firestore
export const database = getFirestore(firebaseApp);

// Inicializa o Auth
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp };
