/***
 * @fileoverview Tool for viewing and verifying terms and title lists.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description View and or verify a term list with a titles list. Term
 * and title list files must have their contents delimited by line breaks.
 * Run the tool without a coomand or with the -h or --help option for help.
 * @requires local-console-logger.js
 * @requires yargs-colorizer.js
 * @requires chalk
 * @example 
 *  // From the command line, visualize term and title files together
 *  <code>node ./terms-tool.js show front-end-terms.txt front-end-titles.txt</code>
 * @license MIT
 */
const fs = require('fs')

const readline = require('readline')

const chalk = require('chalk')

const logger = require('../../../local-console-logger.js').console
const C = require('../cli/lib/custom-hex-colors.js').palettes.pastelOne
const cl = require('../cli/lib/color-console-log.js').trueColor.pastelOne
const colorizeYargs = require('../cli/lib/yargs-colorizer.js')

const c = {
  rose: chalk.hex(C.rose),
  cornflower: chalk.hex(C.cornflower),
  mint: chalk.hex(C.mint),
  peach: chalk.hex(C.peach),
  shalimar: chalk.hex(C.shalimar),
  pink: chalk.hex(C.pink)
}

//const colorizeArray = (strings, color = 'cornflower') => strings.map( str => eval(`c.${color}(str)`) )

const COMMAND_NAMES = ['show', 'check', 'convert']

const CMD_SHOW = {
  NAME: COMMAND_NAMES[0],
  ALIASES: ['s','view'],
  DESC: c.mint('Show terms and their corresponding titles side by side in the console.')
}

const CMD_CHECK = {
  NAME: COMMAND_NAMES[1],
  ALIASES: ['c', 'report'],
  DESC: c.mint('Checks that terms and title files have the same number of items. Reports on any differences found to the console.')
}

const CMD_CONVERT = {
  NAME: COMMAND_NAMES[2],
  ALIASES: ['C', 'makelist'],
  DESC: c.mint('Coverts terms and titles files to comma delimited lists and outputs them to the console.')
}

const parseLines = (uri) => {
  return new Promise((resolve, reject) => {
    let data = []
    const fileStream = fs.createReadStream(uri)

    fileStream.on('error', e => reject(e))

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    rl.on('line', (line) => {
        data.push(line);
    })
    
    rl.on('close', () => {
        resolve(data);
    })
  })
};

const processFiles = async(termsUri, titlesUri, argv) => {
  let terms, titles

  const enoentMsg = (name) => (
    (name in argv)
      ? `Error processing the command 'show'. The ${name} file does not exist: ${c.pink(argv[name])}`
      : `Internal Error: command: show: No such argv key: ${c.pink(name)}`
  )

  try {
    terms = await parseLines(termsUri)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('terms')),
      process.exit(1)
    )
    logger.error(e)
  }

  try {
    titles = await parseLines(titlesUri)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('titles')),
      process.exit(1)
    )
    logger.error(e)
  }

  return {terms, titles}
}

const cmdShow = async(argv) => {
  const {terms, titles} = await processFiles(argv.terms, argv.titles, argv)

  logger.info(`\nCreating a visual combination of ${
    terms.length} terms and ${
    titles.length} titles from the terms and titles files...`)

  if (terms.length > titles.length) {
    logger.warn('WARNING: There are more terms than titles!')
    titles.length = terms.length
  }

  if (terms.length < titles.length) {
    logger.warn('WARNING: There are more titles than terms!')
    terms.length =  titles.length
  }

  console.log('')

  for (let i = 0; i < terms.length; i++) {
    terms[i]
      ? cl.cornflower.log(`Term: ${terms[i]}`) 
      : logger.error(`Term: ${terms[i]}`) 

    titles[i] 
      ? cl.mint.log(`Title: ${titles[i]}`)
      : logger.error(`Title: ${titles[i]}`)
    
    console.log()
  }

}

const cmdCheck = async(argv) => {
 logger.info(`\nChecking and comparing the number of items in each terms and titles file...`)

  const {terms, titles} = await processFiles(argv.terms, argv.titles)

  if (terms.length == titles.length) {
    logger.success(`SUCCESS: The terms and titles files each had the same number of items: ${terms.length}`)
    logger.success('The terms and titles files are safe to convert to comma delimited lists.')
    process.exit(0)
  }

  if (terms.length < titles.length) {
    logger.error(`--> Mismatch: The terms file had ${titles.length - terms.length} items less than the titles file. <--`)
  } else {
    logger.error(`--> Mismatch: The titles file had ${terms.length - titles.length} items less than the terms file. <--`)
  }

  logger.warn('The terms and titles files are NOT safe to convert to comma delimited lists.'),
  logger.warn('Please ensure that the number of items in each file are equal before converting.')
}

const cmdConvert = async(argv) => {
  const {terms, titles} = await processFiles(argv.terms, argv.titles)

  if (terms.length != titles.length) {
    logger.error('Error: Cannot convert. Titles and terms files are NOT of equal length.')
    logger.warn(`Run the 'check' command for more details ---> $node ./terms-tool.js check ${argv.titles} ${argv.terms}`)
    process.exit(1)
  }

 logger.info(`\nConverting terms and titles files to comma delimited lists...\n`)
  let termsList = terms.join(',')
  let titlesList = titles.join(',')
  logger.success(c.cornflower('Terms:'), termsList)
  console.log()
  logger.success(c.mint('Titles:'), titlesList)
}


const program = require('yargs/yargs')(process.argv.slice(2))
  .scriptName(c.cornflower('terms-tool'))
  .version(c.cornflower('terms-tool 0.1.1'))
  .epilog(c.shalimar('\n© 2020 Devz3n.com'))
  .command({
    command: `${CMD_SHOW.NAME} <terms> <titles>`,
    aliases: CMD_SHOW.ALIASES,
    desc: CMD_SHOW.DESC,
    handler: cmdShow
  })
  .command({
    command: `${CMD_CHECK.NAME} <terms> <titles>`,
    aliases: CMD_CHECK.ALIASES,
    desc: CMD_CHECK.DESC,
    handler: cmdCheck
  })
  .command({
    command: `${CMD_CONVERT.NAME} <terms> <titles>`,
    aliases: CMD_CONVERT.ALIASES,
    desc: CMD_CONVERT.DESC,
    handler: cmdConvert
  })
  .wrap(80)
  .demandCommand(
    3,
    3, 
    chalk.red('Error: You must use exactly one command with the proper number of required arguments.')
  )
  .help();

const main = async(p = program) => {
  const name = p.argv._[0]
  colorizeYargs.pastelColor(program)
  COMMAND_NAMES.includes(name) || (
    logger.error(`Invalid command: ${name}`),
    p.showHelp()
  )
}

// BEGIN: Main Program

main(program)
// END: Main Program



