// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgpTnqu6IwUv_R-Fw1tMHeYemSsq9MpFg",
  authDomain: "locationapp-a3b16.firebaseapp.com",
  projectId: "locationapp-a3b16",
  storageBucket: "locationapp-a3b16.appspot.com",
  messagingSenderId: "569661037567",
  appId: "1:569661037567:web:83b000e7b52acc560625ca",
  measurementId: "G-PDNRVRGKL3"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
