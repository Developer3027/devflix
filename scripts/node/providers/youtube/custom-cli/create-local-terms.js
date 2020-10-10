const fs = require('fs')
const path = require('path')

const c = require('chalk');
const prompt = require('prompt')
const { v4: uuidv4 } = require('uuid');

const sharedLibRoot = path.resolve(__dirname, '../../../')
const hexs = require(path.resolve(sharedLibRoot, 'local-constants.js')).colors.ansi256hexs
const timeStampFile = require(path.resolve(sharedLibRoot, 'local-utils.js')).standard.timeStampFile
const outputFileUri = path.resolve(__dirname, '../data/dump/' + timeStampFile('terms', '.txt'))

const isWriteFile = true

const C = {
  brightGreen: hexs[10],
  brightRed: hexs[9],
  brightCyan: hexs[14],
  brightYellow: hexs[11],
  mediumBlue: hexs[27],
  darkCyan: hexs[6],
  rulesColor: hexs[69]
}

const VERSION = '0.2'
const DECOR = '############################################'
const MSG_WELCOME = c.hex(C.mediumBlue)(`${DECOR}\n### create-local-terms.js -- version ${VERSION} --\n${DECOR}`)
const MSG_RULES = c.hex(C.rulesColor)(`RULES:
  1. Terms and their corresponding titles must be comma delimited lists.
  2. Term and title lists cannot contain a trailing comma.
  3. Term and title lists cannot contain duplicate values.\n`)
const MSG_BEGIN = c.hex(C.brightGreen)('\n--> Creating local terms(s) objects(s) <--\n')
const MSG_COMPLETE = c.hex(C.brightGreen)('\n--> Creating local terms terms(s) objects(s) COMPLETE <--\n')

const log = (...args) => {
  const msg = args.join(' ')
  if (writeFile) writeFile.write(`${msg}\n`);
  console.log( c.hex(C.brightCyan)(msg) )
}

const lengthsMismatchMsg = (terms, titles) => {
 return (
  `${c.hex(C.brightRed)('Error: the number of terms and their corresponding titles must match exactly.')} ` +
  `\n  Terms length: ${terms.length}. Titles length: ${titles.length}\n${c.hex(C.brightYellow)('Try running the script again.')}` 
 )
}

const main = (terms, titles) => {
  console.log(MSG_BEGIN)

  writeFile = isWriteFile
    ? fs.createWriteStream(`${outputFileUri}`, { flags: 'w'})
    : false

  terms.forEach(
    (term, i, a) => log(`{\n  id: "${uuidv4()}",\n  term: "${terms[i]}",\n  title: "${titles[i]}"\n}${i != a.length - 1 ? ',' : ''}`)
  )

  isWriteFile 
    ? console.log(c.hex(C.brightYellow)(`\nThe output has been written to: ${outputFileUri}\n`, MSG_COMPLETE))
    : console.log(MSG_COMPLETE)
}

// Returns false if there are duplicate values in comma delimited string 
const promptValidator = (value) => {
  array = value.split(',')
  return !((new Set(array)).size !== array.length)
}

const promptSchema = {
  properties: {
    terms: {
      description: 'Enter a comma delimited list of terms',
      required: true,
      pattern: /[^,]$/,
      conform: promptValidator,
      message: 'You broke one of the rules! Try again.'
    },
    titles: {
      description: 'Enter a comma delimited list of corresponding titles',
      required: true,
      pattern: /[^,]$/,
      conform: promptValidator,
      message: 'You broke one of the rules! Try again.'
    }
  }
}

// BEGIN: main program
let writeFile
let terms
let titles
console.log(MSG_WELCOME)
console.log(MSG_RULES)
prompt.start({message: c.hex(C.brightGreen)('?')})
prompt.get(promptSchema, function (err, result) {
  if (err) throw new Error(err)
  terms = result.terms.split(',')
  titles = result.titles.split(',')
  return (terms.length != titles.length) 
    ? console.log( c.red( lengthsMismatchMsg(terms, titles) ) )
    : main(terms, titles) 
});
// END: main program

