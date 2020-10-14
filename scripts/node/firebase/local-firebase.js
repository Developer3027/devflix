const _init = require('./init-firebase')

const PROD = 'production'
const DEV = 'development'

let _type = null
let _firebase = null;

class FirebaseReinitializationError extends Error {
  constructor(currentEnv, desiredEnv) {
    super(`Firebase has already been initialized for the ${
      currentEnv} environment and cannot be reinitialized for the ${
      desiredEnv} environment.`)
    this.name = 'FirebaseReinitializationError'
    Error.captureStackTrace(this, FirebaseReinitializationError)
  }
}

const development = {
  get: () => {
    if (_type === PROD) {
      throw new FirebaseReinitializationError(PROD, DEV)
    }
    if (_firebase === null) {
      _firebase = _init.initalizeApp(_init.getDevelopmentConfig())
      _type = 'development'
    }
    return _firebase
  }
}

const production = {
  get: () => {
    if (_type === DEV) {
      throw new FirebaseReinitializationError(DEV, PROD)
    }
    if (_firebase === null) {
      _firebase = _init.initalizeApp(_init.getProductionConfig())
      _type = 'production'
    }
    return _firebase
  }
}

module.exports = {
  development,
  production,
}