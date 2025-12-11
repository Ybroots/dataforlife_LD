import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Thay thế bằng Firebase config của bạn từ Firebase Console
// Vào https://console.firebase.google.com/ -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAjgFuS0Uk0vgmzmSHlAstEK0sfSbs-Qhs",
  authDomain: "danhbacald.firebaseapp.com",
  projectId: "danhbacald",
  storageBucket: "danhbacald.appspot.com",
  messagingSenderId: "663552674964",
  appId: "1:663552674964:android:6f8a2cdca8b2ad4175f881"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
export const db = getFirestore(app);

export default app;