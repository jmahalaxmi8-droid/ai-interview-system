// Firebase Configuration
// Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5_rTpaRq05KAYGLbuevg8YjM0Cwp76jM",
    authDomain: "ai-interview-system-88f2a.firebaseapp.com",
    databaseURL: "https://ai-interview-system-88f2a-default-rtdb.firebaseio.com",
    projectId: "ai-interview-system-88f2a",
    storageBucket: "ai-interview-system-88f2a.firebasestorage.app",
    messagingSenderId: "202453946969",
    appId: "1:202453946969:web:fc3765c02f60a6c9df5748"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
