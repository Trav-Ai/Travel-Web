// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc28Cg-mUQMIb4bz0c9WAwI2KigmlaIUY",
  authDomain: "travel-web-4c1d8.firebaseapp.com",
  projectId: "travel-web-4c1d8",
  storageBucket: "travel-web-4c1d8.firebasestorage.app",
  messagingSenderId: "1090268759054",
  appId: "1:1090268759054:web:56af5f5c6b88cb4287e85f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();