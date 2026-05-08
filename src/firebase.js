import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZIaGlsAQEgBuliZrz-1_dyHlIcc45roM",
  authDomain: "ganabov-pro.firebaseapp.com",
  projectId: "ganabov-pro",
  storageBucket: "ganabov-pro.firebasestorage.app",
  messagingSenderId: "707171473273",
  appId: "1:707171473273:web:eb330ccd350ee9ceb481a8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
