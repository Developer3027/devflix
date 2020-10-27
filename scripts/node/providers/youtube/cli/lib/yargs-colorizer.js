/***
 * @fileoverview Colorizes some parts of yargs output.
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

const pastelOne = require('./custom-hex-colors').palettes.pastelOne

const Options = (yargs, hex) => {
  yargs.updateStrings({ 'Options:': c.hex(hex)('Options:') })
}

const Commands = (yargs, hex) => {
  yargs.updateStrings({ 'Commands:': c.hex(hex)('Commands:') })
}

const Examples = (yargs, hex) => {
  yargs.updateStrings({ 'Examples:': c.hex(hex)('Examples:') })
}

const Positionals = (yargs, hex) => {
  yargs.updateStrings({ 'Positionals:': c.hex(hex)('Positionals:') })
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

const command = (yargs, hex) => {
  yargs.updateStrings({ 'command': c.hex(hex)('command') })
}

const boolean = (yargs, hex) => {
  yargs.updateStrings({ 'boolean': c.hex(hex)('boolean') })
}

const string = (yargs, hex) => {
  yargs.updateStrings({ 'string': c.hex(hex)('string') })
}

const number = (yargs, hex) => {
  yargs.updateStrings({ 'number': c.hex(hex)('number') })
}

const array = (yargs, hex) => {
  yargs.updateStrings({ 'array': c.hex(hex)('array') })
}

const count = (yargs, hex) => {
  yargs.updateStrings({ 'count': c.hex(hex)('count') })
}

const Default = (yargs, hex) => {
  yargs.updateStrings({ 'default:': c.hex(hex)('default:') })
}

const choices = (yargs, hex) => {
  yargs.updateStrings({ 'choices:': c.hex(hex)('choices:') })
}

const aliases = (yargs, hex) => {
  yargs.updateStrings({ 'aliases:': c.hex(hex)('aliases:') })
}
const required = (yargs, hex) => {
  yargs.updateStrings({ 'required': c.hex(hex)('required') })
}

const pastelColor = (yargs) => {
  Options(yargs, pastelOne.rose)
  Commands(yargs, pastelOne.rose)
  Examples(yargs, pastelOne.rose)
  Positionals(yargs, pastelOne.rose)
  required(yargs, pastelOne.coral)
  aliases(yargs, pastelOne.pink)
  command(yargs, pastelOne.peach)
  choices(yargs, pastelOne.peach)
  count(yargs, pastelOne.peach)
  Default(yargs, pastelOne.peach)
  boolean(yargs, pastelOne.shalimar)
  string(yargs, pastelOne.shalimar)
  number(yargs, pastelOne.shalimar)
  array(yargs, pastelOne.shalimar)
  ShowVersion(yargs, pastelOne.mint)
  ShowHelp(yargs, pastelOne.mint)
  NotEnoughNonOptionArgs(yargs)
  TooManyNonOptionArgs(yargs)
}

module.exports = {
  pastelColor,
  Options,
  Commands,
  Examples,
  Positionals,
  ShowVersion,
  ShowHelp,
  NotEnoughNonOptionArgs,
  TooManyNonOptionArgs,
  required,
  aliases,
  command,
  boolean,
  choices,
  count,
  Default,
  string,
  number,
  array,
}