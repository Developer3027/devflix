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
const envPath = path.resolve(__dirname, '../../local.env')
const envResult = require('dotenv').config({path: envPath, encoding: 'latin1'})
const dumpPath = path.resolve(__dirname, 'data/dump/')

// BEGIN: Share files in the node scripts root such as local utils 
require.main.paths.push(path.resolve(__dirname, '../'))
const util = require('local-utils').standard;
const fsUtil = require('local-utils').fileSystem;
const { throwFatal } = require('../local-utils');
const err = require('local-contstants').errors;
const decor = require('local-contstants').decor;
// END: Share files in the node scripts root such as local utils 


envResult.error && (
  (/ENOENT/).test(envResult.error) 
    ? util.throwFatal( err.ERROR_BAD_ENV_PATH + /'(.*?)'/.exec(envResult.error)[0] ) 
    : util.throwFatal(envResult.error)
)

const KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = process.env.YOUTUBE_API_BASE_URL;

const getSearchByTerms = (terms = 'cats', config) => {
  const FUNC_NAME = 'getSearchByTerms():';
  const WARN_TERM_ENCODING_MSG = `${FUNC_NAME} Search terms cannot be URI encoded before they are sent
  --> Search terms have been decoded and will be encoded automatically when required.\nOffending terms were: `
  const isDryRun = (config && config.hasOwnProperty('isDryRun')) ? config.isDryRun : false

  // Handle errors
  !isDryRun && config && !config.hasOwnProperty('key') && util.throwFatal(err.ERROR_MISSING_KEY_PARAM)

  console.log(`\n${decor.HR}`)
  console.log(`${FUNC_NAME} Performing ${isDryRun ? 'a dry run of' : ''} an async youtube API search request`);

  // Handle warninigs
  util.isUriEncoded(terms) && ( terms = decodeURI(terms), util.warn(WARN_TERM_ENCODING_MSG + encodeURI(terms)) )

  const params = ( config )
    ? config
    : { q: terms, 
        key: KEY,
        type: 'video',
        order: 'rating',
        part: 'snippet',
        maxResults: 2,
        relevanceLanguage: 'en'
      }
  
  console.log(`Sending query params: ${JSON.stringify(params, null, 2)}`)

  if (isDryRun) {
    console.log(' --> This is a dry run, no http request was made.');
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
  return axios.get(BASE_URL + 'videos', { params })
}

let terms = [];
terms.push('complete react tutorial 2020');
/*
// works
getSearchByTerms(terms[0], {isDryRun: true})
  .then( res => {
    console.log(`Async search result complete: ${res.hasOwnProperty('data')
      ? JSON.stringify(res.data, null, 2) 
      : JSON.stringify(res, null, 2)}`)
    console.log(`${decor.HR}\n`)
  })
  .catch( err => {
    util.warn(`async search result FAILED using terms: ${terms}, Message: ${err.message}`)
    console.log(`${decor.HR}\n`)
  })

let videoIds = [];
videoIds.push('lh7pcHeGnsU');
*/

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

 