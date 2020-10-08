const fs = require('fs')

// BEGIN: standard helper methods
const throwFatal = (msg) => { throw new Error(msg) }
const warn = (msg) => console.log(`WARNING: ${msg}`)
const isUriEncoded = (uri = '') => uri !== decodeURI(uri)
const isUriComponentEncoded = (uri = '') => uri !== decodeURIComponent(uri)
const escapeDoubleQuotes = (str) => str.replace(/\\([\s\S])|(")/g,"\\$1$2")
const stringify = (input) => (typeof input === 'object') ? JSON.stringify(input) : input
const timeStamp = () => new Date().toISOString().slice(11, 22)
const timeStampForFile = () => new Date().toISOString().slice(11, 22).replace(/:/g, '.')
const dateStamp = () => {
  const d = new Date().toISOString().slice(0, 10).split('-')
  return [d[1], d[2], d[0]].join('-')
}
const timeStampFile = (prefix, fileExt) => `${prefix}_${timeStampForFile()}${fileExt ? fileExt : ''}`
const dateStampFolder = (prefix) => `${prefix}_${dateStamp()}`

// END: standard helper methods

// BEGIN: file system helper methods.

/**
 * Writes or appends a file. Creates the file if it does not exist. The default behavior is the overwrite the file.<br />
 * A file may be appended if the <code>appendFile</code> property in the options argument is set to true<br />
 * Write behavior will be automatically set by the <code>appendFile</code> property unless the <code>flag</code> property in the options argument is set to anything other than 'w' or  'a'.
 *
 * @param {string} uri - Full path to the file being written.
 * @param {string} data - A string contaning the data to be written to the file.
 * @param {string} options - If an options argument is not provided or a property is left out, defaults will be used.
 * <pre>
 * appendFile (boolean) | false
 * encoding (string) | Default: 'utf8'
 * mode (integer) | Default: 0o666
 * flag (string) | This property is not used by default. See below<br />
 *  The <code>appendFile</code> property will set this the flag to 'a' when it's value is <code>true</code> or set the flag to 'w' when it's value is false.<br />
 *  Use other system flags at your own risk. 
 *  If you do use a system flag other than 'w' or 'a', the <code>appendFile</code> property will be ignored.
 *  See https://nodejs.org/api/fs.html#fs_file_system_flags for more information
 * </pre> 
 * @return {Promise} A promise indicating success or failure of the writeFile or appendFile operation.
 *
 * @example
 *  // standalone
 *  writeFile('dump.txt', 'Hello World').then( res => console.log(res)).catch(e => console.log(e))
 * 
 *  // In an asynchronous loop
 *  const asyncWriteFileLoop = async (uri, seed) => {
 *    for (let i = 0; i < dataArr.length; i++) {
 *      await writeFile(uri, seed[i])
 *  }
 *  asyncWriteFileLoop('dumpt.txt', ['this','that','The only item you will see in the file'])
} 
 */
const writeFile = (uri, data, options = { appendFile: false }) => new Promise((resolve, reject) => {
  const defaultOpts = {
    appendFile: false,
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w'
  }
  
  // Merge default options with the options arg. options arg takes precedence
  const opts = {
    ...defaultOpts,
    ...options
  }
  // The appendfile value takes precedence over the flag value if needed
  if (opts.flag === 'w' || opts.flag === 'a') {
    opts.flag = opts.appendFile ? 'a' : 'w'
  }
  
  let method;
  const write = opts.appendFile ? ((method = 'Appending'), fs.appendFile ) : ((method = 'Writing'), fs.writeFile )
  console.log(`${method} file...`)
  write(uri, data, opts, (err) => {
    if (err) {
      return reject(`Error: ${uri} --> ${err}`)
    }
    resolve(`Success with file: ${uri}`)
  })
})
/**
 * Safely creates a directory if it does not exist.
 *
 * @param {string} path - The path to the directory
 * @param {integer} mask - Optional: An octal integer representing the permissions of the directory
 * @param {function} cb - A callback function to handle errors
 * 
 * @example
 *
 *  createDirIfNeeded(__dirname + '/upload', 0744, function(err) {
 *    if (err) // handle folder creation error
 *    else // we're all good
 *  });
 */
function createDirIfNeeded(path, mask, cb) {
  if (typeof mask == 'function') { // allow the `mask` parameter to be optional
      cb = mask;
      mask = 0777;
  }
  fs.mkdir(path, mask, function(err) {
      if (err) {
          if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
          else cb(err); // something else went wrong
      } else cb(null); // successfully created folder
  });
}
// END: file system helper methods

module.exports = {
  standard: {
    throwFatal,
    warn,
    isUriEncoded,
    isUriComponentEncoded,
    escapeDoubleQuotes,
    timeStampFile,
    dateStampFolder
  },
  fileSystem: {
    writeFile,
    createDirIfNeeded,
  }
}