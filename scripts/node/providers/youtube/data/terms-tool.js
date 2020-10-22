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
const cl = require('../cli/lib/color-console-log').trueColor.pastelOne
const colorizeYargs = require('../cli/lib/yargs-colorizer.js')

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

const colorizeArray = (strings, color = 'cornflower') => strings.map( str => eval(`c.${color}(str)`) )

const COMMAND_NAMES = ['show', 'check']

const CMD_SHOW = {
  NAME: COMMAND_NAMES[0],
  ALIASES: ['s','view'],
  DESC: c.mint('Show terms and their corresponding titles side by side.')
}

const CMD_CHECK = {
  NAME: COMMAND_NAMES[1],
  ALIASES: ['c', 'verify'],
  DESC: c.mint('Verifies that terms and title files are of equal length.')
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

const cmdShow = async(argv, p = program) => {
  const enoentMsg = (name) => (
    (name in argv)
      ? `Error processing the command 'show'. The ${name} file does not exist: ${argv[name]}`
      : `Internal Error: command: show: No such argv key: ${name}`
  )
 
  let terms, titles

  try {
    terms = await parseLines(argv.terms)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('terms')),
      process.exit(1)
    )
    logger.error(e)
  }

  try {
    titles = await parseLines(argv.titles)
  } catch (e) {
    e.code === 'ENOENT' && (
      logger.error(enoentMsg('titles')),
      process.exit(1)
    )
    logger.error(e)
  }

  console.log('')

  if (terms.length > titles.length) {
    logger.warn('WARNING: There are more terms than titles!')
    titles.length = terms.length
  }

  if (terms.length < titles.length) {
    logger.warn('WARNING: There are more titles than terms!')
    terms.length =  titles.length
  }

  cl.rose.log(`Creating a visual combination of ${terms.length} terms and ${titles.length} titles from the two files...`)
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

const cmdCheck = (argv, p = program) => {
  cl.rose.log(`Verifying length of ${argv.terms} with ${argv.titles}`)
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
  .wrap(72)
  .demandCommand(3, 3, chalk.red('Error: You must use exactly one command with the proper number of required arguments.'))
  .help();

const main = async(p = program) => {
  const name = p.argv._[0]

  COMMAND_NAMES.includes(name) || (
    logger.error(`Invalid command: ${name}`),
    p.showHelp()
  )
}

// BEGIN: Main Program
colorizeYargs.Options(program, C.rose)
colorizeYargs.Commands(program, C.rose)
colorizeYargs.aliases(program, C.pink)
colorizeYargs.command(program, C.peach)
colorizeYargs.boolean(program, C.shalimar)
colorizeYargs.ShowVersion(program, C.mint)
colorizeYargs.ShowHelp(program, C.mint)
colorizeYargs.NotEnoughNonOptionArgs(program)
colorizeYargs.TooManyNonOptionArgs(program)
main(program)
// END: Main Program



