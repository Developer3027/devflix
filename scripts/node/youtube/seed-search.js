/***
 * @fileoverview Gathers youtube video data for seeding a database
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Seeds a firestore with various types of video data.
 *  Also this script can generate .json files instead of seeding a firestore. 
 *  a local.env file is required to be in the root of the scripts folder.
 * @see template.env for variable names to put in required local.env file.
 */

const axios = require('axios').default;
const path = require('path')

const dumpPath = path.resolve(__dirname, 'data/dump/')
const envPath = path.resolve(__dirname, '../../local.env')
const envResult = require('dotenv').config({path: envPath, encoding: 'latin1'})

// BEGIN: Shared files
/* 
  NOTE: This is a hack for 'local' modules
  so they dont have to be qualified npm modules.
  this will not work when nested. Meaning it seems like
  you cannot share files that share files though.
*/

// script root
require.main.paths.push(path.resolve(__dirname, '../'))

// database initializer 
require.main.paths.push(path.resolve(__dirname, '../firebase'))

// local seed data
require.main.paths.push(path.resolve(__dirname, 'data')) 

const initFirebase = require('init-firebase')
const SEED = require('local-seed')
const util = require('local-utils').standard;
const fsUtil = require('local-utils').fileSystem;
const err = require('local-contstants').errors;
const decor = require('local-contstants').decor;
const SIZE = require('local-contstants').numbers;
// END: Shared files 

/* 
// temp stuff, sample api request we will probably need to use
https://www.googleapis.com/youtube/v3/videos?part=snippet&id=LeIAfZyK6Kw&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8
https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=US&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8
https://www.googleapis.com/youtube/v3/videos?part=contentDetails%2Clocalizations%2Cplayer%2Csnippet&id=LeIAfZyK6Kw&key=AIzaSyCDxZv4R57xo2q3YggIR7sl53qjzTiPaM8

https://www.googleapis.com/youtube/v3/channels?part=snippet%2C contentDetails%2C statistics&forUsername=TechGuyWeb&key=AIzaSyDDpCvJ5fhNFcGy-exLOOfC2DULQWtnJFc
*/

// BEGIN: Bootstrap
envResult.error && (
  (/ENOENT/).test(envResult.error) 
    ? util.throwFatal( err.ERROR_BAD_ENV_PATH + /'(.*?)'/.exec(envResult.error)[0] ) 
    : util.throwFatal(envResult.error)
)

const firebase = initFirebase.initalizeApp(initFirebase.getDevelopmentConfig())
//const firebase = initFirebase.initalizeApp(initFirebase.getProductionConfig())
//const db = firebase.firestore()
const db = firebase.firestore()

const testDb = (db, collectionName) => {
  return db.collection(collectionName)
}

/*
// works good
let testName = 'test' //'films'
testDb(db, testName)
  .get()
  .then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`All data in '${testName}' collection`, data); 
  });
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
  const FUNC_NAME = 'getSearchByTerms():';
  const WARN_TERM_ENCODING_MSG = `${FUNC_NAME} Search terms cannot be URI encoded before they are sent
  --> Search terms have been decoded and will be encoded automatically when required.\nOffending terms were: `

  const isDryRun = (config && config.hasOwnProperty('isDryRun')) ? config.isDryRun : false
  // TODO: decide if we should delete the above propertie(s) now (or before the request is made) 
  // so that they do not get set as query params to the api endpoint. no big deal right now.

  const defaultConfig = { 
    q: term, 
    key: KEY,
    type: 'video',
    order: 'rating',
    part: 'snippet',
    maxResults: 50,
    relevanceLanguage: 'en'
  }
  // merge configs, if a config is passed in then it takes precedence over the defaults
  const params = {...defaultConfig, ...config }

  console.log(`\n${decor.HR}`)
  console.log(`${FUNC_NAME} Performing ${isDryRun ? 'a dry run of' : ''} an async youtube API search request`);

  // Handle warninigs
  util.isUriEncoded(term) && ( term = decodeURI(terms), util.warn(WARN_TERM_ENCODING_MSG + encodeURI(term)) )

  console.log(`Sending query params: ${JSON.stringify(params, null, 2)}`)

  if (isDryRun) {
    console.log(' --> This is a dry run,  no search list http request was made.');
    console.log(` --> Search term: ${term}`)
    return Promise.resolve('dry run success')
  }

  return axios.get(BASE_URL + 'search', { params })
}

// INPROGRESS: to be used on the seedSearches() function
const getSearchesByTerms = async (terms = ['cats','dogs'], config) => {
  // temp for testing
  terms = terms.slice(0, 1)
  
  const FUNC_NAME = 'getSearchesByTerms():'
  const isDryRun = (config && config.hasOwnProperty('isDryRun')) ? config.isDryRun : false
  const isSkipVideoQuery = (config && config.hasOwnProperty('skipVideoQuery')) ? config.skipVideoQuery : false

  const results = []

  console.log(decor.HR)
  console.log(`${FUNC_NAME} starting...`)

  try {
    // do search queries
    for (let i = 0; i < terms.length; i++) {
      let result;
      try {
        result = await getSearchByTerm(terms[i], config)
        result.data && (result.data.searchTerm = terms[i])
        results.push(result)
        console.log(` ${FUNC_NAME} --> Success, youtube API search list request: ${i + 1} of ${terms.length}`)
      } catch (err) {
        console.log(err) // preserves the stack trace
        return Promise.reject(`${FUNC_NAME} Failed: ${err}`)
      }
    }
    
    // do video queries if required
    if (true) { // true is TEMP, need to use something like: result.data to handle dry runs and http requests that return no data
      if (!isSkipVideoQuery) {
        for (let i = 0; i < results.length; i++) {
          const searchTerm = results[i].data.searchTerm
          console.log(decor.HR)
          console.log(` ${FUNC_NAME} handling video queries for search list result: ${searchTerm}`)
          console.log(decor.HR)
          for (let j = 0; j < results[i].data.items.length; j++) {  
            const videoId = results[i].data.items[j].id.videoId
            console.log( `  --> making a video list request for videoId: ${videoId}`)
            try {
              const videoResult = await getVideoListById(videoId)

              //videoResult.data && console.log(`received data: ${JSON.stringify(videoResult.data)}`) // uncomment if needed for testing

              console.log(`  request successful for videoId: ${videoId} <--`)

              if (!videoResult.data) {
                console.log(`ERROR: The response for videoId: ${videoId} contained no data object! defaultLanguageId was not gathered!`)
              } else {
                const defaultAudioLanguage = videoResult.data.items[0].snippet.defaultAudioLanguage 
                console.log(`inserting defaultLanguageId: '${defaultAudioLanguage}' into the id object of the proper video item in the search results for term: ${results[i].data.searchTerm}`)
                results[i].data.items[j].id.defaultAudioLanguage = defaultAudioLanguage
              }
            } catch (err) {
              console.log(err)
              return Promise.reject(`async video list result FAILED for videoId: ${videoId},  ${err}`)
            }
          }
        }
      }
    } else {
      // If it is not a dry run and there is no data we have a non fatal error.
      !isDryRun && console.log(' ERROR: There was no data in the response from the https request! Aborting.')
      // otherwise assume if it's a dry run and everything is OK.
      isDryRun && console.log(` --> would have made a video query but this is a dry run ;)`)
    }

  } catch (err) {
    console.log(err)
    return Promise.reject(`FAILED: ${err}`)
  }

  return Promise.resolve(results)
}
const getVideoListById = (id, config) => {
  !id && util.throwFatal(err.ERROR_MISSING_VIDEO_ID)
  config && !config.hasOwnProperty('key') && throwFatal(err.ERROR_MISSING_VIDEO_ID_PARAM)

  // all supported parts are: 'contentDetails,localizations,player,snippet'
  const params = {
    id,
    key: KEY,
    part: 'snippet,contentDetails'
  }
  //return axios.get(BASE_URL + 'videos', { maxContentLength: SIZE.ONE_MEGABYTE, params })
  return axios.get(BASE_URL + 'videos', { params })
}

/**
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
 * Queries and dumps search list results to the database and or local files.
 * A seperate video query is made for each video in the search list, and the
 * <code>defaultLanguageId</code> property is added to the data object returned.
 * The video query can be omitted by adding <code>skipVideoQuery: true</code>
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

const testConfig = { isDryRun: false, skipVideoQuery: false, }
getSearchesByTerms(SEED.frontendSearchTerms, testConfig)
  .then((res) => {
    console.log(`getSearchesByTerms() completed. Check the log for any non fatal errors`)
    /*
    fsUtil.writeFile(path.join(dumpPath, 'getSearchesByTerms-output.json'), res)
      .then(success => console.log(success))
      .catch(e => console.log(e))
      */
    console.log(` final result of the first search result is (with defaultAudioLanguage inserted): ${JSON.stringify(res[0].data, null, 2)}`)
    console.log(decor.HR)
  })
  .catch(e=>console.log(e))
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
