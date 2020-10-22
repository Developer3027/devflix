/* 
  NOTE: please respect the alphabetical order when adding new color names anywhere.
  Whenever adding a new color constant add it to the root of module exposrts and
  to the all object. If adding a color to a pallete or creating a new palette be sure
  to add that color to all three places. Avoid adding to existing palette and try to
  add all your colors at once when create new palettes.
*/

const cornflower = '#AFD7FF'
const mint = '#AFFFD7'
const pink = '#FFAFD7'
const peach = '#FFD7AF'
const rose = '#FFAFFF'
const salmon = '#FFAFAF'
const shalimar = '#FFFFAF'

module.exports = {
  palettes: {
    pastelOne: {
      cornflower,
      mint,
      pink,
      peach,
      rose,
      salmon,
      shalimar
    }
  },
  all: {
    cornflower,
    mint,
    pink,
    peach,
    rose,
    salmon,
    shalimar
  }
}