/***
 * @fileoverview Colorizes sopme parts of yargs output.
 * @author <a href="maito:apolo4pena@gmail.com">Apolo Pena</a>
 * @description Colorize portions of the yargs output by passing in an 
 * instance of a yargs program and a hex color code string.
 * Note: y18n (localization support) will be lost when using this module.
 * To write additional cutomizations for this modules please
 * @see https://github.com/yargs/yargs/blob/master/locales/en.json
 * @requires chalk
 * @example 
 *  // Turn the 'Options:' Header in a yargs program's output a rose color
 *  require('yargs-colorizer.js').Options(myYargsProgram, '#FFAFFF')
 * @license MIT
 */
c = require('chalk')

module.exports = {
  Options: (yargs, hex) => {
    yargs.updateStrings({ 'Options:': c.hex(hex)('Options:') })
  },
  Commands: (yargs, hex) => {
    yargs.updateStrings({ 'Commands:': c.hex(hex)('Commands:') })
  },
  Examples: (yargs, hex) => {
    yargs.updateStrings({ 'Examples:': c.hex(hex)('Examples:') })
  },
  ShowVersion: (yargs, hex) => {
    yargs.updateStrings({ 'Show version number': c.hex(hex)('Show version number') })
  },
  ShowHelp: (yargs, hex) => {
    yargs.updateStrings({ 'Show help': c.hex(hex)('Show help') })
  },
  NotEnoughNonOptionArgs: (yargs, hex) => {
    yargs.updateStrings({
      "Not enough non-option arguments: got %s, need at least %s": {
        "one": c.red("Not enough non-option arguments: got %s, need at least %s"),
        "other": c.red("Not enough non-option arguments: got %s, need at least %s")
      }
    })
  },
  TooManyNonOptionArgs: (yargs, hex) => {
    yargs.updateStrings({
      "Too many non-option arguments: got %s, maximum of %s": {
        "one": c.red("Too many non-option arguments: got %s, maximum of %s"),
        "other": c.red("Too many non-option arguments: got %s, maximum of %s")
      }
    })
  },
  aliases: (yargs, hex) => {
    yargs.updateStrings({ 'aliases:': c.hex(hex)('aliases:') })
  },
  command: (yargs, hex) => {
    yargs.updateStrings({ 'command': c.hex(hex)('command') })
  },
  boolean: (yargs, hex) => {
    yargs.updateStrings({ 'boolean': c.hex(hex)('boolean') })
  },
}