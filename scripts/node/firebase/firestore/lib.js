/***
 * @fileoverview Firebase/Firestore Web SDK wrapper
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Allows the sharing of an initialized Firebase and Firestore. Also firestore 
 * helper methods can be shared between web apps and node.js scripts running on the desktop 
 * such as command line programs. Not for use with cloud functions or server to server needs. 
 * Rather use the Firebase Admin SDK for that.
 */
const path = require('path')

const firebase = require('firebase')

const firestore = require('firebase').firestore
const firebaseSetup = require(path.resolve(__dirname, '../local-firebase.js'))
const _app = firebaseSetup.development.get()
const _db = _app.firestore()

const exit = () => {
  _app.delete()
}
const collectionExists = async (name) => {
  const ref = _db.collection(name)
  const docRef = await ref.limit(1).get()
  return !docRef.empty
}

module.exports = {
  firestore,
  firebaseApp: _app,
  firestoreDb: _db,
  helpers: {
    exit,
    collectionExists,
  },
  shortcuts: {
    FieldValue: firebase.firestore.FieldValue,
    arrayUnion: firebase.firestore.FieldValue.arrayUnion
  }
}