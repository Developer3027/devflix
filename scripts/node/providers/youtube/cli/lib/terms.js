const path = require('path')


const c = require('chalk');
const prompt = require('prompt');

const C = require('./colors.js').colors
const sharedLibRoot = path.resolve(__dirname, '../../../../')
const utilsUri = path.resolve(sharedLibRoot, 'local-utils.js')

const timeStampFile = require(utilsUri).standard.timeStampFile
const snakeCase = require(utilsUri).standard.wordsToSnakeCase
const uuidRegex = require(utilsUri).regexp.validUUID

// BEGIN: shared firebase, firestore
const firestoreLib = require(path.resolve(__dirname, sharedLibRoot, 'firebase/firestore/lib.js'))

const arrayUnion = firestoreLib.shortcuts.arrayUnion
const collectionExists = firestoreLib.helpers.collectionExists
const exit = firestoreLib.helpers.exit // exits gracefully, releases all firebase resources

const firebaseApp = firestoreLib.firebaseApp
const db =  firestoreLib.firestoreDb
// END: shared firebase, firestore

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
const writeTerms = async (terms, options) => {
  let force;
  options && (force = options.force)
  const collectionName = 'terms'
  const docName = ('type' in terms[0]) ? snakeCase(terms[0].type) : 'internalError'
  console.log(c.hex((force ? C.mediumOrange : C.mediumGreen))(`Attempting to ${force ? 'force seed' : 'seed'} term object(s) in the '${
    collectionName}' collection for the '${docName}' document...`)
  )
  const termsRef = db.collection(collectionName)
  const exists = await collectionExists(collectionName) // should probably check the document not the collection?? Oh well the force option handles this for now

  if (exists && !force) return Promise.reject(
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
      collectionName}' was created and the document '${docName}' was added. ${terms.length} term object(s) was seeded into the '${
      docName}' document.`
    )
  )
}


/**
 * Appends the items array in a document of the terms collection in the 
 * Firestore with an array of term objects. The document in the terms 
 * collection that will be appended is the snakecase version of the value 
 * of the 'type' property of the first terms object in the array passed in.
 * This method can only be used to update terms, not to seed them.
 *
 * @param {array} n - An array of terms objects.
 * @return {Promise<string>} A promise with an error or succes string message
 *
 * @example
 *  // Writes two term objects to the Firestore
 *  appendTerms([termsObj1, termsObj2])
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
    c.hex(C.brightGreen)(`Terms object(s) successfully appended ${terms.length} terms in the '${
      collectionName} collection for the '${
      docName}' document. NOTE: Duplicates were ignored.`)
  )
}

const termValidationLogger = (msg) => console.log(c.hex(C.mediumOrange)(msg))

const validateTerm = (term, debug = false, logger = termValidationLogger) => {
  const logOffending = (term) => logger(`Offending term:\n${JSON.stringify(term, null, 2)}`)
  const valid = {
    id: 'string',
    type: 'string',
    term: 'string',
    title: 'string'
  }

  const keyTotal = Object.keys(valid).length
  let t, keyCnt = 0;

  for (const [key, value] of Object.entries(term)) {
    if (!(key in valid)) {
      debug && (
        logger(`Term had an invalid key: ${key}`),
        logOffending(term)
      )
      return false
    }

    keyCnt++
    t = typeof value

    if (t !== valid[key]) {
      debug && (
        logger(`Term had an invalid value type: <${t}>. Expected <${valid[key]}>.`),
        logOffending(term)
      )
      return false
    }
    
    if (key === 'id' && !uuidRegex.test(value)) {
      debug && (
        logger(`Term had an id that was not a valid UUID: ${value}`),
        logOffending(term)
      )
      return false
    }
  }

  if (keyCnt !== keyTotal) {
    debug && (
      logger(`Term had an incorrect number of keys. Got ${keyCnt}. Expected exactly ${keyTotal}`),
      logger(`NOTE: A term requires the following keys:\n ${Object.keys(valid).join('\n ')}`),
      logOffending(term)
    )
    return false
  }

  return true
}

const validateTerms = (terms, debug = false, logger = termValidationLogger) => {
  const TYPE = ( ('type' in terms[0]) ? terms[0].type : false)
  const ERR_NO_TYPE = 'Term(s) invalid at index 0, no type property.'
  const mismatchMsg = (i) => {
    return `Term type value mismatch at index ${i}. All type properties must have the same value of '${TYPE}'`
  }
  const logOffending = (term) => logger(`Offending term:\n${JSON.stringify(term, null, 2)}`)

  let isValid, isSameType
  
  if (!TYPE) {
    logger(ERR_NO_TYPE)
    logOffending(terms[0])
    return false
  }

  for (const [i, term] of terms.entries()) {
    if (('type' in term) && term.type != TYPE) {
      debug && (
        logger(mismatchMsg(i)),
        logOffending(term)
      )
      isValid = false
      break;
    }
    isValid = validateTerm(term, debug)
  }

  return isValid
}

let t = [
  {
    id: "d67780f7-2265-4d58-9904-5396376b5a2b",
    type: 'front end',
    term: "go1",
    title: 'yeah4'
  },
  {
    id: "e67780f7-2265-4d58-9904-5396376b5a2b",
    type: "front end",
    term: "go2",
    title: 'yeah5'
  },
  {
    id: "f67780f7-2265-4d58-9904-5396376b5a2b",
    type: 'front end',
    term: "go3",
    title: 'yeah5'
  }
]

const validateUniqueness = (terms, logger = termValidationLogger) => {
  const getSet = (key) => new Set(terms.map(v => v[key]))
  const rules = ['id','term','title']
  const sets = rules.map(key => getSet(key))
  for (const [i, set] of sets.entries()) {
    if (set.size < terms.length) {
      logger('ERROR: A term object in the array had a non-unique value.\n' +
        'Every value in a term object execept the type property must be unique.\n' +
        `The problematic term object property was: ${rules[i]}`)
      return false
    }
  }
  return true
}

// NOTE: incurs 1 Firestore read charge
const existsInDb = async(terms, logger = termValidationLogger) => {
  // assume the document exists, grab the document, compare data against terms argument.
  const docName = ('type' in terms[0]) ? snakeCase(terms[0].type) : 'internalError'
  const docSnapshot = await db.collection('terms').doc(docName).get()
  if (!docSnapshot.exists) {
    return false
  }
  const dbTerms = docSnapshot.data().items
  // loop through dbTerms and check from duplicate values against terms array argument
}

existsInDb(t)

//console.log(validateUniqueness(t))

module.exports = {
  seed: writeTerms,
  append: appendTerms,
  validateTerms,
  validateUniqueness,
  exit,
}
