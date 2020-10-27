const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn');
const { italic } = require('chalk');

const should = require('chai').should()
const assert = require('chai').assert

require('chai').should();

let uri = path.resolve('./', 'data/terms-visualizer.js')

const expectedOutput1 = `
Creating a visual combination of 3 terms and 3 titles from the terms and titles files...

Term: foo
Title: title for foo

Term: bar
Title: title for bar

Term: baz
Title: title for baz

`

const expectedOutput2 = `
Creating a visual combination of 3 terms and 5 titles from the terms and titles files...
WARNING: There are more titles than terms!

Term: foo
Title: title for foo

Term: bar
Title: title for bar

Term: baz
Title: title for baz

Term: undefined
Title: title for foobar

Term: undefined
Title: title for foobarbaz

`

const expectedOutput3 = `
Creating a visual combination of 5 terms and 3 titles from the terms and titles files...
WARNING: There are more terms than titles!

Term: foo
Title: title for foo

Term: bar
Title: title for bar

Term: baz
Title: title for baz

Term: foobar
Title: undefined

Term: foobarbaz
Title: undefined

`

function assertNotNull(val) {
  should.exist(val)
}
describe('terms-visualizer.js test suite', function() {
  describe(`command 'show' with valid terms and titles files of equal length`, function() {
    let [stdio, stdout, stderr] = runCmd('show', ['../test/stub/local-terms/terms-3.txt', '../test/stub/local-terms/titles-3.txt'])
    it(`No error codes, command was successful`, function(done) {
      stdout.length.should.not.equal(0, 'stdout was empty')
      done()
    })
    it('Has the expected output', function(done) {
      stdout.should.equal(expectedOutput1)
      done()
    })
  })

  describe(`command 'show' with valid terms and titles but more titles than terms`, function() {
    let [stdio, stdout, stderr] = runCmd('show', ['../test/stub/local-terms/terms-3.txt', '../test/stub/local-terms/titles-5.txt'])
    it(`No error codes, command was successful`, function(done) {
      stdout.length.should.not.equal(0, 'stdout was empty')
      done()
    })
    it('Has the expected output', function(done) {
      stdout.should.equal(expectedOutput2)
      done()
    })
  })

  describe(`command 'show' with valid terms and titles but more terms than titles`, function() {
    let [stdio, stdout, stderr] = runCmd('show', ['../test/stub/local-terms/terms-5.txt', '../test/stub/local-terms/titles-3.txt'])
    it(`No error codes, command was successful`, function(done) {
      stdout.length.should.not.equal(0, 'stdout was empty')
      done()
    })
    it('Has the expected output', function(done) {
      stdout.should.equal(expectedOutput3)
      done()
    })
  })

})

function runCmd(cmdName, args) {
  let child = spawn.sync('node', [uri, cmdName, ...args], {stdout: process.stdout, stderr: process.stderr});
  const [_stdio, _stdout, _stderr] = child.output
  const stdio = (_stdio ? _stdio.toString() : null)
  const stdout = (_stdout ? _stdout.toString() : null)
  const stderr = (_stderr ? _stderr.toString() : null)

  return [
    (!stdio ? '' : stdio),
    (!stdout ? '' : stdout), 
    (!stderr ? '' : stderr)
  ]
}
//let bin = spawn('node', [uri, 'show', '../test/stub/local-terms/terms-5.txt', '../test/stub/local-terms/titles-5.txt'], {stdio: 'pipe', stdout: process.stdout, stderr: process.stderr});

/*
let child = spawn.sync('node', [uri, 'show', '../test/stub/local-terms/terms-5.txt', '../test/stub/local-terms/titles-5.txt'], {stdout: process.stdout, stderr: process.stderr});
const [stdio, stdout, stderr] = child.output
stdio && console.log(`stdio: ${stdio}`)
stdout && console.log(`stdout: ${stdout}`)
stderr.length > 0 && console.log(`sterr: ${stderr}`)
*/