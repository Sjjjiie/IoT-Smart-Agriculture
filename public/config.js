// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs6_E8Y7gJtpYC-M6jmTRgLIOotQjhFhk",
  authDomain: "agricultureiot-e0eff.firebaseapp.com",
  projectId: "agricultureiot-e0eff",
  storageBucket: "agricultureiot-e0eff.firebasestorage.app",
  messagingSenderId: "902087703549",
  appId: "1:902087703549:web:bc8800fd420d32bd1af794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);