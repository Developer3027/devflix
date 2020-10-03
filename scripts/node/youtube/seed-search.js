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
const db = firebase.firestore()

const testDb = (db, collectionName) => {
  return db.collection(collectionName)
}

testDb(db, 'test')
  .get()
  .then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("All data in 'test' collection", data); 
  });

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
  const params = ( config ) ? {...defaultConfig, ...config } : defaultConfig

  console.log(`\n${decor.HR}`)
  console.log(`${FUNC_NAME} Performing ${isDryRun ? 'a dry run of' : ''} an async youtube API search request`);

  // Handle warninigs
  util.isUriEncoded(term) && ( term = decodeURI(terms), util.warn(WARN_TERM_ENCODING_MSG + encodeURI(term)) )

  console.log(`Sending query params: ${JSON.stringify(params, null, 2)}`)

  if (isDryRun) {
    console.log(' --> This is a dry run,  no http request was made.');
    console.log(` --> Search term: ${term}`)
    return Promise.resolve('dry run success')
  }

  return axios.get(BASE_URL + 'search', { params })
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
          .then(success => { // writeFile errors are caught here
            console.log(success)
          })
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

const testDry = { isDryRun: true }
dumpSearchesToFiles(SEED.frontendSearchTerms, testDry)
  .then((res) => console.log(res))
  .catch(e=>console.log(e))

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
