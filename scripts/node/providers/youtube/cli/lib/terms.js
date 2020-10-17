/***
 * @fileoverview Library for working with <code>terms</code>data
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Validation and Firestore database hlpers for seeding and appending data.
 * @see <code>terms-cli.js</code>
 * @license MIT
 */

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

let localTerms = [
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
    title: 'yeah6'
  },
  {
    id: "31714771-8020-41d8-8a6a-7ffe4b01f357",
    type: "front end",
    term: "more tests",
    title: "more tests title"
  }
]
let dbTerms = [
  {
    id: "g67780f7-2265-4d58-9904-5396376b5a2b",
    type: 'front end',
    term: "go11",
    title: 'yeah44'
  },
  {
    id: "h67780f7-2265-4d58-9904-5396376b5a2b",
    type: "front end",
    term: "go22",
    title: 'yeah55'
  },
  {
    id: "i67780f7-2265-4d58-9904-5396376b5a2b",
    type: 'front end',
    term: "go33",
    title: 'yeah66'
  }
]

/**
 * Validates an array of term object in regard to certain properties
 * that must have unique values, see below.
 *
 * @param {array} terms - An array of terms objects
 * @param {function} [logger = termValidationLogger] - Function to use for debugging output 
 * @return {boolean} True if <code>id</code>, <code>term</code> and <code>title</code>
 * values are unique. False if otherwise.
 *
 * @example
 *  let terms = [
 *    {id:1,type:'front end',term:'foo',title:'bar'},
 *    {id:2,type:'front end',term:'foobar',title:'bar'}
 *  ]
 *  // Outputs false, since the second term object also has a title of 'bar'
 *  console.log(validateUniqueness(terms))
 */
const validateUniqueness = (terms, logger = termValidationLogger) => {
  const getSet = (key) => new Set(terms.map(v => v[key]))
  const rules = ['id','term','title']
  const sets = rules.map(key => getSet(key))
  for (const [i, set] of sets.entries()) {
    if (set.size < terms.length) {
      logger('ERROR: A term object in the array had a non-unique value.\n' +
        'Every value in a term object except the type property must be unique.\n' +
        `The problematic term object property was: ${rules[i]}`)
      return false
    }
  }
  return true
}

// NOTE: incurs 1 Firestore read charge when the testTerms argument is not passed in
const existsInDb = async(terms, testTerms = null) => {
  let dbTerms, culprits = []
  if (testTerms) {
    dbTerms = testTerms
  } else {
    const docName = ('type' in terms[0]) ? snakeCase(terms[0].type) : 'internalError'
    const docSnapshot = await db.collection('terms').doc(docName).get()
    if (!docSnapshot.exists) return false
    dbTerms = docSnapshot.data().items
  }

  for (const [i, localTerm] of terms.entries()) {
    for (const dbTerm of dbTerms) {
      if (localTerm['term'] === dbTerm['term']) {
        culprits.push({
          dbId: dbTerm.id,
          index: i,
          term: dbTerm.term, 
          title: null
        })
      } else if (localTerm['title'] === dbTerm['title']) {
        culprits.push({
          dbId: dbTerm.id,
          index: i,
          term: null, 
          title: dbTerm.title
        })
      }
    }
  }

  return (culprits.length > 0) ? culprits : Promise.resolve(false)
}

// NOTE: incurs 1 Firestore read charge when the testTerms argument is not passed in
const existsInDbVerbose = async(localTerms, testTerms) => {
  const logger = (termValidationLogger ? termValidationLogger : console.log())
  try {
    let alreadyExistsInDb

    if (testTerms) { 
      alreadyExistsInDb = await existsInDb(localTerms, testTerms)
    } else {
      alreadyExistsInDb = await existsInDb(localTerms)
    }

    if (alreadyExistsInDb) {
      logger(`\nERROR: Terms data you were trying to append the database already existed ` +
        `in the database.\nOnly the 'type' property can be non unique.`)
        logger( 'Report:')
      alreadyExistsInDb.forEach(culprit => {
        logger(`problematic local term object:\n${JSON.stringify(localTerms[culprit.index], null, 2)}`, '')
        culprit.term && (
          logger(`'term' property value already exists in the database: ${culprit.term}`),
          logger(`id in the database for that terms object is: ${culprit.dbId}`)
        )
        culprit.title && (
          logger(`'title' property value already exists in the database: ${culprit.title}`),
          logger(`id in the database for that terms object is: ${culprit.dbId}\n`)
        )
      })
    } else {
      console.log(c.hex(C.brightGreen)(`\nNo duplicate data was found between local the term data objects and the terms data
in the database. Data is safe to append to the database.`))
    }
  } catch (e) {
    console.log(e)
  }
}

//existsInDbVerbose(localTerms, dbTerms)

/*
// test existsInDb()
try {
  ;(async()=>{
    const alreadyExistsInDb = await existsInDb(localTerms, dbTerms)
    if (alreadyExistsInDb) {
      console.log(`ERROR: Terms data you were trying to append the database already existed ` +
        `in the database.\nOnly the 'type' property can be non unique.`)
      console.log( 'Report:')
      alreadyExistsInDb.forEach(culprit => {
        console.log(`problematic local term object:\n${JSON.stringify(localTerms[culprit.index], null, 2)}`, '')
        culprit.term && (
          console.log(`'term' property value already exists in the database: ${culprit.term}`),
          console.log(`id in the database for that terms object is: ${culprit.dbId}`)
        )
        culprit.title && (
          console.log(`'title' property value already exists in the database: ${culprit.title}`),
          console.log(`id in the database for that terms object is: ${culprit.dbId}`)
        )
      })
    } else {
      console.log(`Appending ${localTerms.length} Terms object to the database`)
    }
  })()
} catch (e) {
  console.log(e)
}
*/

//console.log(validateUniqueness(t))

module.exports = {
  seed: writeTerms,
  append: appendTerms,
  validateTerms,
  validateUniqueness,
  exit,
}
