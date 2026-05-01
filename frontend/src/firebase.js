// Firebase is optional (used only for Google OAuth)
// If no API key is provided, Firebase is not initialized
import { initializeApp, getApps } from "firebase/app";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;

if (apiKey && apiKey.trim() !== "") {
  const firebaseConfig = {
    apiKey,
    authDomain: "task-manager-c9dda.firebaseapp.com",
    projectId: "task-manager-c9dda",
    storageBucket: "task-manager-c9dda.appspot.com",
    messagingSenderId: "252343493674",
    appId: "1:252343493674:web:15f42600d70c7ce99e8f53",
  };

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

export { app };
