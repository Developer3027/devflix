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

const C = {
  rose: '#FFAFFF',
  cornflower: '#AFD7FF',
  mint: '#AFFFD7',
  peach: '#FFD7AF',
  shalimar: '#FFFFAF',
  pink: '#FFAFD7'
}

const Options = (yargs, hex) => {
  yargs.updateStrings({ 'Options:': c.hex(hex)('Options:') })
}

const Commands = (yargs, hex) => {
  yargs.updateStrings({ 'Commands:': c.hex(hex)('Commands:') })
}

const Examples = (yargs, hex) => {
  yargs.updateStrings({ 'Examples:': c.hex(hex)('Examples:') })
}

const ShowVersion = (yargs, hex) => {
  yargs.updateStrings({ 'Show version number': c.hex(hex)('Show version number') })
}

const ShowHelp = (yargs, hex) => {
  yargs.updateStrings({ 'Show help': c.hex(hex)('Show help') })
}

const NotEnoughNonOptionArgs = (yargs, hex) => {
  yargs.updateStrings({
    "Not enough non-option arguments: got %s, need at least %s": {
      "one": c.red("Not enough non-option arguments: got %s, need at least %s"),
      "other": c.red("Not enough non-option arguments: got %s, need at least %s")
    }
  })
}

const TooManyNonOptionArgs = (yargs, hex) => {
  yargs.updateStrings({
    "Too many non-option arguments: got %s, maximum of %s": {
      "one": c.red("Too many non-option arguments: got %s, maximum of %s"),
      "other": c.red("Too many non-option arguments: got %s, maximum of %s")
    }
  })
}

const aliases = (yargs, hex) => {
  yargs.updateStrings({ 'aliases:': c.hex(hex)('aliases:') })
}

const command = (yargs, hex) => {
  yargs.updateStrings({ 'command': c.hex(hex)('command') })
}

const boolean = (yargs, hex) => {
  yargs.updateStrings({ 'boolean': c.hex(hex)('boolean') })
}

const pastelColor = (yargs) => {
  Options(yargs, C.rose)
  Commands(yargs, C.rose)
  aliases(yargs, C.pink)
  command(yargs, C.peach)
  boolean(yargs, C.shalimar)
  ShowVersion(yargs, C.mint)
  ShowHelp(yargs, C.mint)
  NotEnoughNonOptionArgs(yargs)
  TooManyNonOptionArgs(yargs)
}

module.exports = {
  pastelColor,
  Options,
  Commands,
  Examples,
  ShowVersion,
  ShowHelp,
  NotEnoughNonOptionArgs,
  TooManyNonOptionArgs,
  aliases,
  command,
  boolean
}