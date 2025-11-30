import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBY935kf5cNk_IcceUheJsn3r4zypMKRbM",
    authDomain: "market-tracker-29898.firebaseapp.com",
    projectId: "market-tracker-29898",
    storageBucket: "market-tracker-29898.firebasestorage.app",
    messagingSenderId: "739839831262",
    appId: "1:739839831262:web:2f81ea12616f08137a264f",
    measurementId: "G-J9XXRQ0S0N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
