const path = require('path')
const Firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

const throwFatal = (msg) => { throw new Error(msg) }

const loadEnv = (envType = 'prod') => {
  if (!['prod', 'dev'].includes(envType)) throw new Error('Invalid Environment Type Argument')

  const envPath = path.resolve(__dirname, `../../firebase.${envType}.env`)
  const envResult = require('dotenv').config({path: envPath, encoding: 'latin1'})

  const ERROR_BAD_ENV_PATH = 'Could not find required file at expected location: ';

  envResult.error && (
    (/ENOENT/).test(envResult.error) 
      ? throwFatal( ERROR_BAD_ENV_PATH + /'(.*?)'/.exec(envResult.error)[0] ) 
      : throwFatal(envResult.error)
  )
}

const getDevelopmentConfig = () => {
  loadEnv('dev')
  return {
    apiKey: process.env.DEV_DB_API_KEY,
    authDomain: process.env.DEV_DB_AUTH_DOMAIN,
    databaseURL: process.env.DEV_DB_DATABASE_URL,
    projectId: process.env.DEV_DB_PROJECT_ID,
    storageBucket: process.env.DEV_DB_STORAGE_BUCKET,
    appId: process.env.DEV_DB_APP_ID,
    measurementId: process.env.DEV_DB_MEASUREMENT_ID
  }
}

const getProductionConfig = () => {
  loadEnv('prod')
  return {
    apiKey: process.env.PROD_DB_API_KEY,
    authDomain: process.env.PROD_DB_AUTH_DOMAIN,
    databaseURL: process.env.PROD_DB_DATABASE_URL,
    projectId: process.env.PROD_DB_PROJECT_ID,
    storageBucket: process.env.PROD_DB_STORAGE_BUCKET,
    messagingSenderId: process.env.PROD_MESSAGING_SENDER_ID,
    appId: process.env.PROD_DB_APP_ID
  }
}


const initalizeApp  = (config) => Firebase.initializeApp(config)

module.exports = { 
  getProductionConfig,
  getDevelopmentConfig,
  initalizeApp
}