/***
 * @fileoverview Gathers youtube video data for seeding a database
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Seeds a firestore with various types of video data.
 *  Also this script can generate .json files instead of seeding a firestore. 
 *  a local.env file is required to be in the root of the scripts folder.
 * @see template.env for variable names to put in required local.env file.
 * @license MIT
 */

const axios = require('axios').default;
const path = require('path')


const dumpPath = path.resolve(__dirname, 'data/dump/')
const sharedLibRoot = path.resolve(__dirname, '../../')
const envPath = path.resolve(sharedLibRoot, '../local.env')
const envResult = require('dotenv').config({path: envPath, encoding: 'latin1'})

// BEGIN: Shared files
/* 
  NOTE: This is a hack for 'local' modules
  so they dont have to be qualified npm modules.
  this will not work when nested. Meaning it seems like
  you cannot share files that share files though.
*/

// script 'local' modules root
require.main.paths.push(sharedLibRoot)

// local firebase helpers 
require.main.paths.push(path.resolve(__dirname, sharedLibRoot, 'firebase'))

// local seed data
require.main.paths.push(path.resolve(__dirname, 'data')) 

const firebaseSetup = require('local-firebase')
const util = require('local-utils').standard;
const fsUtil = require('local-utils').fileSystem;
const ERR = require('local-constants').errors;
const DECOR = require('local-constants').decor;
const SIZE = require('local-constants').numbers;
const MSG = require('local-constants').messages;

// END: Shared files 

/* 
// temp stuff, sample api request we will probably need to use
https://www.googleapis.com/youtube/v3/videos?part=snippet&id=LeIAfZyK6Kw&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8
https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8
https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2Clocalizations%2Cplayer%2Csnippet&id=LeIAfZyK6Kw&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8

https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=TechGuyWeb&key=AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc
*/

// BEGIN: Bootstrap
envResult.error && (
  (/ENOENT/).test(envResult.error) 
    ? util.throwFatal( ERR.ERROR_BAD_ENV_PATH + /'(.*?)'/.exec(envResult.error)[0] ) 
    : util.throwFatal(envResult.error)
)

// temp grab terms data
const frontEndTerms = require(path.resolve(__dirname, 'test/stub/local-test-data.js')).frontendSearchTerms

// simulates options being passed to the script, use and edit the values here below until a proper options systems is implemented
const globalOptions = {
  dryRun: false, 
  dryRunVideoCount: 5,
  skipVideoRequests: false,
  useNetworkStub: false, 
  writeLogToFile: false, /* TODO: implement */
  writeSearchRequestsToFiles: false, /* implement today */
  writeVideoRequestsToFiles: false, /* implement today */
  WriteFinalResultToFile: false, /* implement today */
  writeFinalResultToDatabase: false, /* TODO: implement */
}

require('firebase')
//const firebase = firebaseSetup.development.get()
const db = firebaseSetup.development.get().firestore()

const testDb = (db, collectionName) => {
  return db.collection(collectionName)
}

const writeTermsToDb = async (db, terms) => {
  const ref = db.collection('terms')
  for ( const term of terms) {
    const {id, ...data} = term
    try {
      await ref.doc(id).set(data)
      console.log('success')
    } catch (e) {
      console.log(`firestore problem: ${e}`)
    }
  }
  console.log('Done')
  //process.exit(0)
  //firebase.app().delete()
  /*
  terms.forEach((term, i) => {
    const {id, ...data} = terms[i]
    await ref.doc(id).set(data)
  })
  */
}
const main = async () => {
  await writeTermsToDb(db, frontEndTerms)
  console.log('more')
  await writeTermsToDb(db, frontEndTerms)
  console.log('even more')
  await writeTermsToDb(db, frontEndTerms)
  console.log('now done, exiting script')
  process.exit(0)
}
//main()

const getNetworkStubUri = (type) => path.resolve(__dirname, `test/stub/network-response/${type}-list.json`)
const getNetworkStub = (type) => require(getNetworkStubUri(type))

const logTerms = async () => {
  const ref = db.collection('terms')
  const allTerms = await ref.get();
  console.log(allTerms)
  if (allTerms.exists) {
    allTerms.forEach(doc => console.log(doc.id, '=>', doc.data()))
  } else {
    console.log('no data found')
  }
}

//logTerms()

/*
// works good
let testName = 'terms' //'films'
testDb(db, testName)
  .get()
  .then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`All data in '${testName}' collection`, data); 
  }).catch(e => console.log(e));
*/


try {
  fsUtil.createDirIfNeeded(dumpPath, 0o744, err => err && util.throwFatal(err))
} catch (err) { 
  console.log(`Could not create dump folder: ${err}`)
}

const KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = process.env.YOUTUBE_API_BASE_URL;
// END: Bootstrap

/**
 * Makes a youtube API search list request
 *
 * @param {string} term - The keywords to use for the search. Supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode this string.
 * @param {object} config - Optional Axios configuration object
 * @return {Promise} A an Axios promise
 *
 * @example
 * // With async/await and error handling using the default axios config
 * try {
 *    let result = await getSearchByTerm('neat stuff')
      result.data && console.log(`received data: ${result.data})
      console.log('Success: youtube API search request')
 * } catch (e) console.log(e)
 *
 *  // With promises (and accounting for a dry run)
 *  getSearchByTerm('neat stuff')
 *   .then( res => { 
 *     console.log(`search result complete: 
 *       ${res.hasOwnProperty('data')
         ? JSON.stringify(res.data, null, 2) 
         : JSON.stringify(res, null, 2)}`)
      })
      .catch( err => {
        console.log(err)
      })
 */
const getSearchByTerm = (term = 'cats', config) => {
  const API = 'search'
  const FUNC_NAME = 'getSearchByTerms():';
  const WARN_TERM_ENCODING_MSG = `${FUNC_NAME} Search terms cannot be URI encoded before they are sent
  --> Search terms have been decoded and will be encoded automatically when required.\nOffending terms were: `
  const defaultConfig = { 
    q: term, 
    key: KEY,
    type: 'video',
    order: 'rating',
    part: 'snippet',
    maxResults: 50,
    relevanceLanguage: 'en'
  }
  const params = {...defaultConfig, ...config }  // merge configs, if a config is passed in takes precedence
  console.log(`\n${DECOR.HR}`)
  console.log(` Performing ${globalOptions.dryRun ? 'a dry run of' : ''} a youtube API ${API} list request`);
  util.isUriEncoded(term) && ( term = decodeURI(terms), util.warn(WARN_TERM_ENCODING_MSG + encodeURI(term)) )
  console.log(` Sending query params: ${JSON.stringify(params, null, 2)}`)
  if (globalOptions.dryRun) {
    console.log(` --> ${MSG.DRY_RUN}, no search list http request was actually made.`);
    console.log(` --> Search term: ${term}`)
    return Promise.resolve(`search list request: ${MSG.DRY_RUN_SUCCESS}`)
  }
  if (globalOptions.useNetworkStub) {
    console.log(`--> globalOptions.useNetworkStub: true. Using a network stub file. The data in the response is FAKE!`)
    console.log(`--> Path to fake data: ${getNetworkStubUri(API)}`)
    return Promise.resolve(getNetworkStub(API))
  }
  return axios.get(BASE_URL + API, { maxContentLength: SIZE.ONE_MEGABYTE, params })
}

// Works good.TODO: jsdoc it, handle dry runs, skipping video requests and the edge case where there is no data in the search list response
const getSearchesByTerms = async (terms = ['cats','dogs'], config) => {
  terms = terms.slice(0, 2)  // temp for testing
  const FUNC_NAME = 'getSearchesByTerms():'
  const results = []
  let result;

  console.log(DECOR.HR_FANCY)
  console.log(`${FUNC_NAME} STARTING${globalOptions.dryRun ? ' a dry run ' : ''}...`)
  try {
    for (let i = 0; i < terms.length; i++) {
      try {
        const term = terms[i].term
        result = await getSearchByTerm(term, config)
        result.data && (result.data.searchTerm = term)
        results.push(result)
        console.log(` ${FUNC_NAME} --> Success${
          globalOptions.dryRun
            ? 'for dry run'
            : ''}, youtube API search list request: ${i + 1} of ${terms.length}`)
      } catch (err) {
        console.log(err) // preserves the stack trace
        return Promise.reject(`${FUNC_NAME} Failed: ${err}`)
      }
    }
    if (result.data || globalOptions.dryRun) {
      for (let i = 0; i < results.length; i++) {
        let videoTotal = (
          globalOptions.dryRun 
            ? globalOptions.dryRunVideoCount 
            : results[i].data.items.length
        )
        if (!globalOptions.skipVideoRequests) {
          console.log(` \n${FUNC_NAME} handling video list requests for search list result: ${terms[i]}`)
          globalOptions.dryRun && console.log(`   The next ${videoTotal} video list requests will be faked since this is a dry run.\n`)
        } else videoTotal = 0;
        for (let j = 0; j < videoTotal; j++) {
          const videoId = globalOptions.dryRun ? 'FAKE ID' : results[i].data.items[j].id.videoId
          try {
            console.log(`Making video list request ${j + 1} of ${videoTotal}. ${globalOptions.dryRun 
              ? 'This is a dry run, no http request was made.'
              : ''}`
            )
            const videoResult = await getVideoListById(videoId)
            //videoResult.data && console.log(`received data: ${JSON.stringify(videoResult.data)}`) // uncomment if needed for testing
            if (!videoResult.data) {
              if (globalOptions.dryRun) {
                console.log(` No real data was returned but here is where the 
                defaultAudioLanguage would be gathered and inserted into the final results.`)
              }  else {
                console.log(` ERROR: The response for videoId: ${videoId} had no data object! defaultLanguageId was not gathered!`)
              }
            } else { // There was no dryRun and data was returned a from the http request as expected so carry on with the normal flow...
              const defaultAudioLanguage = videoResult.data.items[0].snippet.defaultAudioLanguage
              console.log(`  ${globalOptions.dryRun
                ? 'FAKE (dry run)'
                : 'http ' }request successful for videoId: ${JSON.stringify(results[i].data.items[j].id.videoId)} <--`)
              console.log(`inserting defaultLanguageId: '${
                  defaultAudioLanguage
                }' into the id object of the proper video item in the search results for term: ${results[i].data.searchTerm}`)
              results[i].data.items[j].id.defaultAudioLanguage = defaultAudioLanguage
            }
          } catch (err) {
            console.log(err)
            return Promise.reject(`async video list result FAILED for videoId: ${videoId},  ${err}`)
          }
        }
      }
    } else { 
      console.log(' ERROR: There was no data in the response from the https search list request! No video list requests will be made.')
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(`${FUNC_NAME} FAILED: ${err}`)
  }
  return Promise.resolve(results)
}
// Works good. TODO: jsdoc, ensure axios data limit is more than 2000 bytes
const getVideoListById = (id, config) => {
  const API = 'videos'

  !id && util.throwFatal(ERR.ERROR_MISSING_VIDEO_ID)
  config && !config.hasOwnProperty('key') && throwFatal(ERR.ERROR_MISSING_VIDEO_ID_PARAM)

  // all supported parts are: 'contentDetails,localizations,player,snippet'
  const params = {
    id,
    key: KEY,
    part: 'snippet,contentDetails'
  }
  if (globalOptions.skipVideoRequests) {
    console.log(`globalOptions were set to skip the video request.`)
    return Promise.resolve(`Video request using videoId ${id} was skipped as specified in the globalOptions`)
  }
  if (globalOptions.dryRun) {
    return Promise.resolve('dry run')
  }
  if (globalOptions.useNetworkStub) {
    console.log(`--> globalOptions.useNetworkStub: true. Using a network stub file. The data in the response is FAKE!`)
    console.log(`--> Path to fake data: ${getNetworkStubUri(API)}`)
    return Promise.resolve(getNetworkStub(API))
  }
  console.log( `  --> making a ${API.slice(0, -1)} list http request for videoId: ${id}`)
  //return axios.get(BASE_URL + 'videos', { maxContentLength: SIZE.ONE_MEGABYTE, params })
  console.log(`request url: ${axios.getUri({url: BASE_URL + API, params})}`)
  return axios.get(BASE_URL + API, { maxContentLength: SIZE.ONE_MEGABYTE, params })
}

/** NOTE: THIS FUNCTION WILL BE REPLACED BY seedSearches() function.
 * Makes a series of youtube API search list requests and dumps them to timestamped files in a datestamped folder. Requires a folder named 'data' to be in the root.
 *
 * @param {string} terms - An array of keywords string to use for the searches. Keyword strings supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode keyword strings.
 * @param {object} config - Optional Axios configuration object for the requests. Special name value pair <code>isDryRun: false</code> will omit the http request (for testing).
 *
 * @example
 * // With async/await and error handling using the default axios config
 * TBD
 *
 *  // With promises, using the default configuration and omitting the http request
    dumpSearchesToFiles(SEED.frontendSearchTerms, { isDryRun: true })
      .then((res) => console.log(res))
      .catch(e=>console.log(e))
 */
const dumpSearchesToFiles = async (terms, config) => {
  const FUNC_NAME = 'dumpSearchesToFiles():'
  const SUCCESS_MSG = `${FUNC_NAME} Process completed. Check the log for any possible errors. file writing error are non fatal`
  const FAILURE_MSG = `${FUNC_NAME} ABORTED, there was a failure --> `

  let dirPath;

  try {
    dirPath = path.join(dumpPath, util.dateStampFolder('search'))
    fsUtil.createDirIfNeeded(dirPath, 0o744, err => { if (err) console.log('  --> ERROR, Could not create date stamped folder: ' + err)})
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }

  try {
    console.log(`dumpSearchesToFiles(): Starting a series of async search list requests and writing them to files...`)
    /* 
      FOR TESTING, only write a portion of the terms, saves the API quota while testing.
      Comment the below line of code out when you want query all the data from youtube. 
      There will an API call for each search term and that could be ALOT!
      100 search requests to the API will drain the entire 10000 point quota for the day.
    */
    terms = terms.slice(0, 1) 
    
    for (let i = 0; i < terms.length; i++) {
      let result;
      let fileName = util.timeStampFile(`search-list${i + 1}`, '.json')
      try {
        result = await getSearchByTerm(terms[i], config)
        result.data && (result.data.searchTerm = terms[i])
        console.log('getSearchByTerms() --> Success: youtube API search request') // TODO: do this better
        const uri = path.join(dirPath, fileName)
        await fsUtil.writeFile(uri, JSON.stringify(result.data ? result.data : result, null, 2))
          .then(success => {
            console.log(success)
          })
          // writeFile errors are caught here
          .catch(e => console.log(` ERROR --> writing file ${uri}: ${e}`))
      } catch (err) {
        console.log(err) // preserves the stack trace
        return Promise.reject(`${FAILURE_MSG}${err}`)
      }
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(`${FAILURE_MSG}${err}`)
  }
  return Promise.resolve(SUCCESS_MSG)
}

 
/**
 * IMPORTANT NOTE: THIS WILL REPLACE dumpSearchesToFiles()!!!
 * Requests and writes search list results to the database and or local files.
 * A seperate video query is made for each video in the search list, and the
 * <code>defaultLanguageId</code> property is added to the data object returned.
 * The video querys can be omitted by adding <code>skipVideoQuery: true</code>
 * to the <code>config</code> argument. The https requests (queries) can be 
 * skipped by adding <code>isDryRun: true</code> to the <code>config</code> argument.
 *
 * @param {string} terms - An array of keywords string to use for the searches. Keyword strings supports boolean | (OR) and boolean - (NOT). Do not escape/URI encode keyword strings.
 * @param {boolean} writeFileCb - (optional) A callback to used to write each search list query to a seperate file.
 * @param {object} - (optional) Axios configuration object for the requests.<br />
 * Special properties for this object are: <br />
 * <code>isDryRun (boolean>)</code> - If <code>true</code> the http request will be omitted (for testing)<br />
 * <code>skipVideoQuery (boolean)</code> - If <code>true</code> the video query for each search list result will be skipped.<br />
 * @return {object} An an array of objects representing the json data returned from each search and or video query made.
 * @example
 *
 *     TBD
 */
// TODO: utilize getSearchesByTerms() in the code below to handle the functionality describe in the jsdoc above.
const seedSearches = async (terms, writeFileCb, config) => {
  // temp for testing
  terms = terms.slice(0, 2)

  const FUNC_NAME = 'seedSearches():'
  const SUCCESS_MSG = `${FUNC_NAME} Process completed. Check the log for any possible errors.`
  const FAILURE_MSG = `${FUNC_NAME} ABORTED, there was a failure --> `
  
  let dirPath;

  if (typeof writeFileCb !== 'function' ) { // Allow writeToFiles to be an optional parameter
    config = writeFileCb
    writeFileCb = false
  } 

  try {
    if (writeFileCb) {
      dirPath = path.join(dumpPath, util.dateStampFolder('search'))
      fsUtil.createDirIfNeeded(dirPath, 0o744, err => { if (err) console.log('  --> ERROR, Could not create date stamped folder: ' + err)})
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }

  try {

    // main logic goes here

/*
    // TODO: test error handling
    getSearchesByTerms(terms, config)
    .then((res) => {
      // logic to write to file, and or dump to database goes here
    })
    .catch(e=>console.log(e))
*/

  } catch (err) {
    console.log(err)
    return Promise.reject(`FAIL: ${err}`)
  }
  return Promise.resolve(`SUCCESS!`)
}




// BEGIN: Testing the code
//const testConfig = { isDryRun: false, skipVideoQuery: false, } // old way

globalOptions.dryRun = false
globalOptions.skipVideoRequests = false
//globalOptions.useNetworkStub = true
/*
// Dump all requests into a single file - works good
getSearchesByTerms(frontEndTerms)
  .then((responses) => {
    let merged = {responses: []}
    for (const response of responses) {
      merged.responses.push(response.data)
    }
    fsUtil.writeFile(path.join(dumpPath, util.timeStampFile('all-search-lists', '.json')), JSON.stringify(merged, null, 2))
      .then(success => console.log(success))
      .catch(e => console.log(e))

    //globalOptions.dryRun || console.log(` Final result (entire data object): ${JSON.stringify(merged, null, 2)}`)
    console.log(`getSearchesByTerms() ${globalOptions.dryRun ? 'dry run' : ''} COMPLETED. Check the log for any non fatal errors`)
    console.log(DECOR.HR_FANCY)
  })
  .catch(e=>console.log(e))
*/

// testing for useNetworkStub - works
//getSearchByTerm('HTML').then(res => console.log('Search Term data received.')).catch(e => console.log(e))
getVideoListById('DjSsd7SgIEM').then(res => console.log(`Video data received: ${JSON.stringify(res.data, null, 2)}`)).catch(e => console.log(e))

/*
// works good
dumpSearchesToFiles(SEED.frontendSearchTerms, testDry)
  .then((res) => console.log(res))
  .catch(e=>console.log(e))
*/

let videoIds = [];
videoIds.push('lh7pcHeGnsU');


/*
// works
fsUtil.writeFile(path.join(dumpPath, 'test.txt'), 'this is only a test', {appendFile: true})
  .then(success => console.log(success))
  .catch(e => console.log(e))
*/

/*
// works
getVideoListById(videoIds[0])
  .then( res => console.log(`async video list complete, default language code: ${res.data.items[0].snippet.defaultAudioLanguage}`) )
  .catch( err => warn(`async video list result FAILED for videoId: ${videoIds[0]}, Message: ${err.message}\n${err}`) )
*/

// END: Testing the code
