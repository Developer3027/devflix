import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
// import { seedDatabase } from '../seed'

// need to somehow seed the database

// need config
const config = {
  apiKey: 'AIzaSyA6DK4TpETqUxK_WLOtLCT_zhldeuv8R1Q',
  authDomain: 'devflix-3e3a5.firebaseapp.com',
  databaseURL: 'https://devflix-3e3a5.firebaseio.com',
  projectId: 'devflix-3e3a5',
  storageBucket: 'devflix-3e3a5.appspot.com',
  messagingSenderId: '1016430120320',
  appId: '1:1016430120320:web:c41b2ea4550970d7038565'
}

const firebase = Firebase.initializeApp(config)
// !!!!!!!!!!!!!!!! DO NOT UN-COMMENT THIS SEED !!!!!!!!!!!!!
// You will make duplicate data if this is ran again.
// seedDatabase(firebase)
// !!!!!!!!!!!!!!!! DO NOT UN-COMMENT THIS SEED !!!!!!!!!!!!!

export { firebase }
