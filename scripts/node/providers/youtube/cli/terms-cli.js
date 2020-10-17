/***
 * @fileoverview Command line tool for working with <code>terms</code>.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Create or batch create terme objects and or write them to a Firestore
 * Run the program without options to get usage information.
 * @license MIT
 */

const fs = require('fs')
const path = require('path')
const { promisify } = require('util');

const c = require('chalk');
const prompt = require('prompt')
const promptGetAsync = promisify(prompt.get); // workaround for https://github.com/flatiron/prompt/issues/204
const { v4: uuidv4 } = require('uuid');

const C = require('./lib/colors.js').colors

const {
  seed: seedDb,
  append: appendDb,
  exit: exitGracefully,
  validateTerms,
  validateUniqueness,
  existsInDb,
  existsInDbVerbose
} = require('./lib/terms.js')

const sharedLibRoot = path.resolve(__dirname, '../../../')
const utilsUri = path.resolve(sharedLibRoot, 'local-utils.js')
const timeStampFile = require(utilsUri).standard.timeStampFile
const writeFile = require(utilsUri).fileSystem.writeFile

// BEGIN: global options (TODO: make these command line options)
// If false no file will be written
const isWriteFile = true
// (prop ignored if isWriteFile = false): if false json will be written to file, if true a javascript style object will be written to file
const outputJsObject = false
/*
 If true terms objects will be either seeded or appended to the database. If false nothing is written to the database and
 the flags isSeedDb and isSeedDb will be ignored
*/
const isWriteDb = false
// If true (and isWriteDb = true) all terms data for the term type specified is overwritten in the database. If false terms will be appended. Duplicates will be ignored.
const isSeedDb = true 
// END: globaloptions (TODO: make these command line options)

const outputFileUri = path.resolve(__dirname, '../data/dump/' + timeStampFile( 'terms', (outputJsObject ? '.txt' : '.json') ))
const writer = isWriteFile
  ? fs.createWriteStream(outputFileUri, {flags: 'a'})
  : false
const VERSION = '0.2.1'
const DECOR = '############################################'

const MSG_WELCOME = c.hex(C.mediumBlue)(`${DECOR}\n### create-local-terms.js -- version ${VERSION} --\n${DECOR}`)
const MSG_OPTIONS = c.hex(C.mediumCyan)('Press q and then <Enter> at any time quit.')
const MSG_RULES = c.hex(C.rulesColor)(`RULES:
  1. Terms and their corresponding titles must be comma delimited lists of equal length.
  2. Term and title lists cannot contain a trailing comma.
  3. Term and title lists cannot contain duplicate values.\n`)
const MSG_TERMS_BEGIN = c.hex(C.brightGreen)(`\n--> Creating terms(s) objects(s) as ${
  outputJsObject ? 'JavaScript' : 'JSON'} -->\n`)
const MSG_TERMS_COMPLETE = c.hex(C.brightGreen)(`\nCreating terms(s) objects(s) as ${
  outputJsObject ? '<-- JavaScript' : 'JSON'}: COMPLETE <--\n`)
const MSG_DB_BEGIN = c.hex(C.brightGreen)(`\n--> Attempting to ${isSeedDb ? 'seed' : 'append'} term(s) to the Firestore -->\n`)

const log = (...args) => {
  const msg = args.join(' ')
  if (writer) writer.write(`${msg}\n`)
  console.log( c.hex(C.brightCyan)(msg) )
}

const lengthsMismatchMsg = (terms, titles) => {
 return (
  `${c.hex(C.brightRed)('Error: the number of terms and their corresponding titles must match exactly.')} ` +
  `\n  Terms length: ${terms.length}. Titles length: ${titles.length}\n${c.hex(C.brightYellow)('Try running the script again.')}` 
 )
}

const buildTerms = (type, terms, titles) => {
  console.log(MSG_TERMS_BEGIN)
  let results = [], jsOutput = ''
  terms.forEach(
    (term, i, a) => {
      const id = uuidv4()
      const title = titles[i]
      const termObj = { id, type, term, title }
      if (outputJsObject) {
        jsOutput += `{\n  id: "${
          id}",\n  type: "${
          type}",\n  term: "${
          term}",\n  title: "${
          title}"\n}${i != a.length - 1 ? ',\n' : ''}`
      }
      results.push(termObj)
    }
  )

  if (outputJsObject) {
    log(jsOutput)
  } else {
    const resultsObj = {
      terms: results
    }
    log(JSON.stringify(resultsObj, null, 2))
  }

  isWriteFile 
    ? console.log(c.hex(C.brightYellow)(`\nThe output has been written to: ${outputFileUri}\n`, MSG_TERMS_COMPLETE))
    : console.log(MSG_TERMS_COMPLETE)

  return results
}

// Returns false if there are duplicate values in comma delimited string, exits if the input is q (for quit)
const promptValidator = (value) => {
  value.toLowerCase() === 'q' && process.exit(0)
  let values = value.split(',')
  return !((new Set(values)).size !== values.length)
}

const promptSchemaOne = {
  properties: {
    _type: {
      description: `Choose a type for the terms: enter 1 for 'front end', or 2 for 'back end'`,
      required: true,
      pattern: /^[1|2]$/,
      conform: promptValidator,
      message: 'Only the values 1 or 2 are allowed.' 
    },
    _terms: {
      description: 'Enter a comma delimited list of terms',
      required: true,
      pattern: /[^,]$/,
      conform: promptValidator,
      message: 'You broke one of the rules! Try again.'
    },
    _titles: {
      description: 'Enter a comma delimited list of corresponding titles',
      required: true,
      pattern: /[^,]$/,
      conform: promptValidator,
      message: 'You broke one of the rules! Try again.'
    }
  }
}

const promptSchemaTwo = {
  properties: {
    _yn: {
      description: c.hex(C.mediumOrange)(`WARNING: `) + `This seeding operation could potentially overwrite an entire terms document in the database.
Thousands of search terms could be lost, are you sure you want to proceed (y/n)?`,
      required: true,
      pattern: /^[y|n]$/,
      message: 'Enter either (y) for yes or (n) for no.' 
    }
  }
}

const promptSchemaRequestReport = {
  properties: {
    _report_yn: {
      description: c.hex(C.mediumOrange)(`WARNING: `) + `Duplicate data was found the local terms data and the terms data
that is already in the database. This tool will now exit. Would you like a report first (y/n)?`,
      required: true,
      pattern: /^[y|n]$/,
      message: 'Enter either (y) for yes or (n) for no.' 
    }
  }
}

const cliPartOne = async() => {
  console.log(MSG_WELCOME)
  console.log(MSG_OPTIONS)
  console.log(MSG_RULES);
  prompt.start({message: c.hex(C.brightGreen)('?')})

  const { _type, _terms, _titles } = await promptGetAsync(promptSchemaOne);
  const terms = _terms.split(',')
  const titles = _titles.split(',')
  const type = (_type === '1') ? 'front end' : 'back end';

  let results;
  return (terms.length != titles.length) 
    ? (console.log( c.red( lengthsMismatchMsg(terms, titles) ) ), false)
    : (results = buildTerms(type, terms, titles), results)
}

const cliPartTwo = async() => {
  prompt.start({message: c.hex(C.brightRed)('?')})
  const { _yn } = await promptGetAsync(promptSchemaTwo)
  return _yn
}

const cliRequestReport = async() => {
  prompt.start({message: c.hex(C.brightRed)('?')})
  const { _yn } = await promptGetAsync(promptSchemaRequestReport)
  return _yn
}

const main = async() => {
  const terms = await cliPartOne()

  if (!terms) process.exit(1)
  if (!validateTerms(terms)) process.exit(1)
  if (!validateUniqueness(terms)) process.exit(1)
  if (!isWriteDb) process.exit(0)
  
  console.log(MSG_DB_BEGIN)

  let response
  if (isSeedDb) {
    response = await cliPartTwo()
    const abort = (response === 'n' ? true : false)
    if (abort) {
      console.log('Aborted seeding operation.')
      process.exit(0)
    }
    // Seed database
    await seedDb(terms, { force: true })
      .then( res => ( console.log(res), exitGracefully() ) )
      .catch( e => ( console.log(e), exitGracefully() ) )
  } else {
    // Validate that none of the local data already exists in the database before appending
    const hasDupeData = await existsInDb(terms)
    if (hasDupeData) {
      response = await cliRequestReport()
      if (response === 'y') {
        await existsInDbVerbose(terms)
        console.log('Please fix your data and try again.')
        // TODO: give the user an option to omit the offeding data and append the rest.
      }
    }
    // Append database
    await appendDb(terms)
      .then( res => ( console.log(res), exitGracefully() ) )
      .catch( e => ( console.log(e), exitGracefully() ) )
  }
}


// BEGIN: main program
main()
// END: main program

 