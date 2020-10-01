# Notes regarding the fs writeFile

code author: Apolo

```const fs = require('fs')

const stringify = (input) => (typeof input === 'object') ? JSON.stringify(input) : input

let obj = {
  a: 'this',
  b: {
    bkid: 'that'
  },
  c: 'and',
  d: {
    dKid: {
      dGrandkid: 'the other'
    }
  }
}

const writeFile = (uri, data, options) => new Promise((resolve, reject) => {
  fs.writeFile(uri, stringify(data), (err) => {
    if (err) {
      return reject(`Error writing file: ${uri} --> ${err}`)
    }
    resolve(`Successfully wrote file: ${uri}  --> with data: ${data}`)
  })
})

const appendFile = (uri, data, options) => new Promise((resolve, reject) => {
  fs.appendFile(uri, stringify(data), (err) => {
    if (err) {
      return reject(`Error appending file: ${uri} --> ${err}`)
    }
    resolve(`Successfully appended file: ${uri}  --> with data: ${data}`)
  })
})

const uri1 = 'test-write-dump.txt'
const uri2 = 'test-append-dump.txt'
const dataArr = [
  obj,[1,2,3,4],1600,'foobar',['foo','bar','baz']
]

/*
// works but not what I want, see below
const writeStackAsync = async (uri) => {
  const call1 = await writeFile(uri, dataArr[0])
  const call2 = await writeFile(uri, dataArr[1])
  const call3 = await writeFile(uri, dataArr[2])
  const call4 = await writeFile(uri, dataArr[3])
  const call5 = await writeFile(uri, dataArr[4])
  Promise.all([call1,call2,call3,call4,call5])
    .then(res => console.log(res))
    .catch(e => console.log(e))
}

writeStackAsync(uri) // this works but not what I want, see below
*/

// BEGIN: successful async loop with fs.writeFile and fs.appendFile
// This works: writeFile
const asyncWriteFile = (uri, data) => {
  return writeFile(uri, data).then( res => console.log(res)).catch(e => console.log(e))
}
const asyncWriteFileLoop = async (uri, seed) => {
  for (let i = 0; i < dataArr.length; i++) {
    await asyncWriteFile(uri, seed[i])
  }
}

//asyncWriteFileLoop(uri1, dataArr)

// this works: append file
const asyncAppendFile = (uri, data) => {
  return appendFile(uri, data).then( res => console.log(res)).catch(e => console.log(e))
}
const asyncAppendFileLoop = async (uri, seed) => {
  for (let i = 0; i < seed.length; i++) {
    await asyncAppendFile(uri, seed[i])
  }
}

//asyncAppendFileLoop(uri2, dataArr)

// END: successful async loop with fs.writeFile and fs.appendFile

// Array.map technique just doesnt work.

asyncWriteFileMap = async (uri, seed) => {
  const promises = seed.map(async data => {
    await writeFile(uri, data)
  })
  const result = await Promise.all(promises)
}

//asyncWriteFileMap(uri1, dataArr) // doesnt work, writes a junk file
```
