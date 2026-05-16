import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyC3ZIayZWWCb0d6CMdcdmOf2P2ORkqHfNE",
  authDomain: "copy-factory.firebaseapp.com",
  projectId: "copy-factory",
  storageBucket: "copy-factory.firebasestorage.app",
  messagingSenderId: "463959727238",
  appId: "1:463959727238:web:7e2cef2d34f99411144507"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
