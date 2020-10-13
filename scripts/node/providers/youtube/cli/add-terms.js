const path = require('path')


const c = require('chalk');
const prompt = require('prompt');

const C = require('./colors.js').colors
const sharedLibRoot = path.resolve(__dirname, '../../../')
const utilsUri = path.resolve(sharedLibRoot, 'local-utils.js')

const timeStampFile = require(utilsUri).standard.timeStampFile
const snakeCase = require(utilsUri).standard.wordsToSnakeCase

// BEGIN: shared firebase, firestore
const firestoreLib = require(path.resolve(__dirname, sharedLibRoot, 'firebase/firestore/lib.js'))

const arrayUnion = firestoreLib.shortcuts.arrayUnion
const collectionExists = firestoreLib.helpers.collectionExists
const exit = firestoreLib.helpers.exit // exits gracefully, releases all firebase resources

const firebaseApp = firestoreLib.firebaseApp
const db =  firestoreLib.firestoreDb
// END: shared firebase, firestore

// IN PROGRESS





/**
 * Seeds an array of terms objects to the Firestore.
 * This can only be used to seed terms, not to update them.
 * Two Firestore write charges are incured for this operation.
 *
 * @param {array} n - An array of terms objects
 * @return {Promise<string>} A promise with an error or succes string message
 *
 * @example
 *  // Writes a single term to the Firestore
 *   writeTerms([termsObj])
      .then(res => console.log(res))
      .catch(e => console.log(e))
 */
const writeTerms = async (terms) => {
  const collectionName = 'terms'
  const docName = ('type' in terms[0]) ? snakeCase(terms[0].type) : 'internalError'
  console.log(c.hex(C.mediumGreen)(`Attempting to seed terms object(s) in the '${
    collectionName}' collection for the '${docName}' document...`)
  )
  const termsRef = db.collection(collectionName)
  const exists = await collectionExists(collectionName)

  if (exists) return Promise.reject(
    c.red(`Method aborted: The Firestore collection '${
      collectionName}' already exists.\nYou should use a method that updates to '${
      collectionName + '/' + docName}'. This one would have overwritten it.`
    )
  )

  await termsRef
    .doc(docName)
    .set({ items: terms })
    .catch(e => Promise.reject(c.hex(C.brightRed)('error seeding the document')))

  return Promise.resolve(
    c.hex(C.brightGreen)(`The collection '${
      collectionName}' was created and the document '${docName}' was added. ${terms.length} terms objects were seeded into the '${
      docName}' document.`
    )
  )
}


/**
 * Appends the items array in a document of the terms collection in the 
 * Firestore with an array of terms objects. The document in the terms 
 * collection that will be appended is the snakecase version of the value 
 * of the 'type' property of the first terms object in the array passed in.
 * This method can only be used to update terms, not to seed them.
 *
 * @param {array} n - An array of terms objects.
 * @return {Promise<string>} A promise with an error or succes string message
 *
 * @example
 *  // Writes a single term to the Firestore
 *  appendTerms([termsObj])
      .then(res => console.log(res))
      .catch(e => console.log(e))
 */
const appendTerms = async (terms) => {
  const collectionName = 'terms'
  const docName = ('type' in terms[0]) ? snakeCase(terms[0].type) : 'internalError'
  console.log(c.hex(C.mediumGreen)(`Attempting to append terms object(s) in the '${
    collectionName}' collection for the '${
    docName}' document...`)
  )

  const doc = db.collection(collectionName).doc(docName)

  try {
    await doc.update({ items: arrayUnion(...terms) })
  } catch (e) {
    return Promise.reject(c.hex(C.brightRed)(e.stack))
  }

  return Promise.resolve(
    c.hex(C.brightGreen)(`Terms object(s) successfully appended in the '${
      collectionName} collection for the '${
      docName}' document.`)
  )
}

const testUpdateDoc = async () => {
  const frontEndTermsDoc = termsRef.doc('frontEnd')
  await frontEndTermsDoc.update({
    items: arrayUnion(...[
      {
        id: "2",
        type: "front end",
        term: "complete react native tutorial 2020",
        title: "React Native Tutorials"
      },
      {
        id: "3",
        type: "front end",
        term: "complete Vue tutorial 2020",
        title: "Vue.js Tutorials"
      }
    ])
  }).then(res => {
    console.log('update success')
    //firebaseApp.delete()
  }).catch(e => console.log('PROBLEM: ' + e))
}

const testUpdateMoreDoc = async () => {
  const frontEndTermsDoc = termsRef.doc('frontEnd')
  await frontEndTermsDoc.update({
    items: firebase.firestore.FieldValue.arrayUnion(...[
      {
        id: "4",
        type: "front end",
        term: "complete react native tutorial 2020",
        title: "React Native Tutorials"
      },
      {
        id: "5",
        type: "front end",
        term: "complete Vue tutorial 2020",
        title: "Vue.js Tutorials"
      }
    ])
  })/*.then(res => {
    console.log('update success')
    //firebaseApp.delete()
  }).catch(e => console.log('PROBLEM: ' + e))*/
}

const testUpdateEvenMoreDoc = async () => {
  const frontEndTermsDoc = termsRef.doc('frontEnd')
  await frontEndTermsDoc.update({
    items: firebase.firestore.FieldValue.arrayUnion(...[
      {
        id: "6",
        type: "front end",
        term: " Flexbox vs CSS grid",
        title: " Flexbox vs CSS Grid"
      }
    ])
  })/*.then(res => {
    console.log('update success')
    //firebaseApp.delete()
  }).catch(e => console.log('PROBLEM: ' + e))*/
}

//testUpdateDoc()
//testWriteCollection()
const snaps = []
const listenTerms = async (name, terms) => {
  const doc = db.collection(name).doc('frontEnd')
  const observer = doc.onSnapshot({includeMetadataChanges: true}, s => {
    console.log(`s.metadata: ${JSON.stringify(s.metadata)}`)
    //snaps.push(JSON.stringify(s.get('items'), null, 2))
    //snaps.push
    console.log(`Received doc snapshot: ${snaps}`);
    // ...
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
}

const go = async () => {
  
  await listenTerms('terms')
  //await testUpdateDoc()
  await testWriteCollection()
  console.log('success1')
  await testUpdateDoc()
  console.log('success2')
  await testUpdateMoreDoc()
  console.log('success3')
  await testUpdateDoc()
  console.log('success4')
  await testUpdateEvenMoreDoc()
  console.log('success5')
  await testUpdateDoc()
  console.log('success6')
  await testUpdateDoc()
  console.log('success7')
  console.log('DONE')
  firebaseApp.delete()
}
//go()
const go2 = async () => {
  const l = await listenTerms('terms')
  await testWriteCollection()
  await testUpdateDoc()
  firebaseApp.delete()
}
//go2()
const go3 = async () => {
  //await writeTerms('terms', ).then(res => console.log(res)).catch(e => console.log(e))
  firebaseApp.delete()
}
//go3()
const go4 = async() => {
  const exists = await collectionExists('terms')
  console.log(exists)
  firebaseApp.delete()
}

let terms = [
  {
    id: "1a1f99ae-a50b-4096-8791-13f0ba3341df",
    type: "front end",
    term: "complete react tutorial 2020 -native",
    title: "React Tutorials"
  },
  {
    id: "75d69da3-618f-4567-a58a-d27c1425a1a5",
    type: "front end",
    term: "complete react native tutorial 2020",
    title: "React Native Tutorials"
  },
  {
    id: "238eec8e-f1ee-4b8c-9fe3-81fc52e6f755",
    type: "front end",
    term: "complete Vue tutorial 2020",
    title: "Vue.js Tutorials"
  },
  {
    id: "f3974d7a-b731-4ca3-9141-c54a119475f9",
    type: "front end",
    term: "complete Angular tutorial 2020",
    title: "Angular Tutorials"
  },
  {
    id: "c7fa6929-f9d6-4bb1-a3f9-c8a8b7aa7fae",
    type: "front end",
    term: "redux tutorial -react -native",
    title: "Redux Tutorials"
  },
  {
    id: "cb875f1a-043e-49a4-91ee-510bdd9ca79b",
    type: "front end",
    term: " CSS flexbox tutorial -grid",
    title: "CSS Flexbox Tutorials"
  },
  {
    id: "8c8d1fe9-7172-4f93-b421-120959ccdb2a",
    type: "front end",
    term: " CSS grid tutorial -flexbox",
    title: " CSS Grid Tutorials"
  },
  {
    id: "e16534eb-ee88-4ae8-982a-32b1e3a31e7b",
    type: "front end",
    term: " Flexbox vs CSS grid",
    title: " Flexbox vs CSS Grid"
  }
]

//go4()
const go5 = async () => {
  await writeTerms(terms.slice(0,2))
    .then(res => console.log(res))
    .catch(e => console.log(e))
  await appendTerms(terms.slice(3,6))
    .then(res => console.log(res))
    .catch(e => console.log(e))
  exit()
}
go5()






/*
{
  id: "cb875f1a-043e-49a4-91ee-510bdd9ca79b",
  type: "front end",
  term: " CSS flexbox tutorial -grid",
  title: "CSS Flexbox Tutorials"
},
{
  id: "8c8d1fe9-7172-4f93-b421-120959ccdb2a",
  type: "front end",
  term: " CSS grid tutorial -flexbox",
  title: " CSS Grid Tutorials"
},
{
  id: "e16534eb-ee88-4ae8-982a-32b1e3a31e7b",
  type: "front end",
  term: " Flexbox vs CSS grid",
  title: " Flexbox vs CSS Grid"
}
*/






