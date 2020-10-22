/***
 * @fileoverview CLI to Gather youtube video data, process and seed it a Firestore.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Seeds a Firestore database with various types of youtube API video data.
 * The video data is gathered and processed in batches via a combination of youtube API
 * requests such as the <code>searchlist</code> and <code>videos</code> endpoints.
 * A <code>local.env</code> file with a valid youtube API key base URL is required.
 * @requires lib/videos.js
 * @requires yargs
 * @requires chalk
 * @requires local-console-logger.js
 * @requires yargs-colorizer.js
 * @license MIT
 */

const path = require('path')

const chalk = require('chalk')

const sharedLibRoot = path.resolve(__dirname, '../../../')
const loggerUri = path.resolve(sharedLibRoot, 'local-console-logger.js')

const logger = require(loggerUri).console
const cl = require('./lib/color-console-log').trueColor.pastelOne
const colorizeYargs = require('./lib/yargs-colorizer.js')

const C = {
  rose: '#FFAFFF',
  cornflower: '#AFD7FF',
  mint: '#AFFFD7',
  peach: '#FFD7AF',
  shalimar: '#FFFFAF',
  pink: '#FFAFD7'
}

const c = {
  rose: chalk.hex(C.rose),
  cornflower: chalk.hex(C.cornflower),
  mint: chalk.hex(C.mint),
  peach: chalk.hex(C.peach),
  shalimar: chalk.hex(C.shalimar),
  pink: chalk.hex(C.pink)
}


