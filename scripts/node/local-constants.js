const ERROR_MISSING_VIDEO_ID = 'Missing required id argument. The key should be a videdId.'
const ERROR_MISSING_VIDEO_ID_PARAM = 'The config argument of this method requires a id property representing a valid videoId. This required property was not found.'
const ERROR_MISSING_KEY_PARAM = 'The config argument of this method requires a key property representing a valid API key. This required property was not found.'
const ERROR_BAD_ENV_PATH = 'Could not find required file at expected location: ';

const DRY_RUN = 'dry run'
const DRY_RUN_SUCCESS = `${DRY_RUN} success!`

const ONE_MEGABYTE = 1000000

module.exports = {
  numbers: {
    ONE_MEGABYTE
  },
  decor: {
    HR: '-------------------------',
    HR_FANCY: '========================='
  },
  messages: {
    DRY_RUN,
    DRY_RUN_SUCCESS
  },
  errors: {
    ERROR_MISSING_VIDEO_ID,
    ERROR_MISSING_VIDEO_ID_PARAM,
    ERROR_MISSING_KEY_PARAM,
    ERROR_BAD_ENV_PATH
  }
}