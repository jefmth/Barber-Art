import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBfCW88cgIuY5uLcMyd8v9EeP8Fn3j6OPY',
  authDomain: 'tipo-de-ocorrencias.firebaseapp.com',
  databaseURL: 'https://tipo-de-ocorrencias-default-rtdb.firebaseio.com',
  projectId: 'tipo-de-ocorrencias',
  storageBucket: 'tipo-de-ocorrencias.appspot.com',
  messagingSenderId: '66249122861',
  appId: '1:66249122861:web:6749d0fe402337d60e44a4',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const app = firebase.app();
export const auth = app.auth();
export const database = app.database();
export { firebase };
