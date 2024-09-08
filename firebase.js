// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWUgIWaDeUnpQDf4RO7ovFIy4VOZMbr-A",
  authDomain: "plannowdemo.firebaseapp.com",
  projectId: "plannowdemo",
  storageBucket: "plannowdemo.appspot.com",
  messagingSenderId: "1096899492930",
  appId: "1:1096899492930:web:71ca9a83bf20340b2401db",
  measurementId: "G-G78T4B1C3G"
};

// Initialize Firebase
let app;

if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = firebase.auth();
const storage = firebase.storage();  // Initialize Firebase Storage

export { db, auth, storage };