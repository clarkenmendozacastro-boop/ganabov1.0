// Importaciones Firebase
import { initializeApp } from "firebase/app";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCZIaGlsAQEgBuliZrz-1_dyHlIcc45roM",
  authDomain: "ganabov-pro.firebaseapp.com",
  projectId: "ganabov-pro",
  storageBucket: "ganabov-pro.firebasestorage.app",
  messagingSenderId: "707171473273",
  appId: "1:707171473273:web:eb330ccd350ee9ceb481a8"
};

// Inicializar app
const app = initializeApp(firebaseConfig);

// Firestore OFFLINE
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

// Auth
export const auth = getAuth(app);
