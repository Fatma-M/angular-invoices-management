import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBoQSZJ0XcCmqTBmjZxkdB2mWjnKr1n7C0',
  authDomain: 'invoice-app-ac6c6.firebaseapp.com',
  projectId: 'invoice-app-ac6c6',
  storageBucket: 'invoice-app-ac6c6.appspot.com',
  messagingSenderId: '763853281042',
  appId: '1:763853281042:web:4bdb5594aa768a12a685cb',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default getFirestore(firebaseApp);
