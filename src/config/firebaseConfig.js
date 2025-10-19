// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBWfQ4-CkcQXKDegjJqfr1u9W8lCcQP9NA",
    authDomain: "rnow-72104.firebaseapp.com",
    projectId: "rnow-72104",
    storageBucket: "rnow-72104.firebasestorage.app",
    messagingSenderId: "420984765579",
    appId: "1:420984765579:web:7ff2e960c9d00bd990e88e",
    measurementId: "G-BX6CMPXKP0"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
