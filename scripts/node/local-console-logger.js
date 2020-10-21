/***
 * @fileoverview Simple colorized logging to the console.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description A console API wrapper for logging colorized messages
 * @requires chalk
 * @requires local-ansi256-colors
 * @example 
 *  const logger  = require('./local-console-logger.js')
 *  logger.log('This is a debug message in the systems green color')
    logger.info('This is an info message in a ANSI256 color #00D7FF (medium cyan)')
    logger.warn('This is a warning message in a ANSI256 color #FF8700 (medium orange)')
    logger.error('This is an error message in the systems red color')
    
 * @license MIT
 */

const c = require('chalk');
const C = require('./local-ansi256-colors').colors

module.exports = {
  console: (function(origConsole) {
    const oc = origConsole
    return {
      log: function () {
        oc.log.apply(
          console,
          [...arguments].map(arg => c.green(arg))
        )
      },
      info: function () {
        oc.info.apply(
          console,
          [...arguments].map(arg => c.hex(C.mediumCyan)(arg))
        )
      },
      warn: function () {
        oc.warn.apply(
          console,
          [...arguments].map(arg => c.hex(C.mediumOrange)(arg))
        )
      },
      error: function () {
        oc.error.apply(
          console,
          [...arguments].map(arg => c.red(arg))
        )
      }
    };
  }(console)),
}