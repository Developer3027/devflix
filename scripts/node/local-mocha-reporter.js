// local-mocha-reporter.js
var mocha = require('mocha');
var milliseconds = require('ms');
const Base = mocha.reporters.Base

var EVENT_RUN_BEGIN = 'start';
var EVENT_RUN_END = 'end';
var EVENT_SUITE_BEGIN = 'suite';
var EVENT_SUITE_END = 'suite end';
var EVENT_TEST_FAIL = 'fail';
var EVENT_TEST_PASS = 'pass';
var EVENT_TEST_PENDING = 'pending';
var color = Base.color;

module.exports = MyReporter;

Base.symbols.ok = String.fromCodePoint(0x1F64F) // 0x1F64F is folded hands emoji
Base.symbols.err = String.fromCodePoint(0x1F4A9) // 0x1F4A9 pile of poo emoji
Base.symbols.covid = String.fromCodePoint(0x1F637) // 0x1F637 is face with medical mask emoji
Base.symbols.angry = String.fromCodePoint(0x1F92C) // 0x1F92C is face with symbols on mouth
Base.symbols.time = String.fromCharCode(0x1F551) // 0x1F551 is two o' clock emoji

Base.colors['error title'] = 35 // ANSI magenta

Base.colors['cyan'] = 36

mocha.utils.inherits(MyReporter, mocha.reporters.Spec);

function MyReporter(runner, options) {
  Base.call(this, runner, options)

  Base.prototype.epilogue = function() {
    var stats = runner.stats;
    var color = Base.color;
    var fmt;
  
    Base.consoleLog();
    if (stats.failures) {
      Base.consoleLog(color('fail', `Listing ${Base.symbols.err}'s`))
      Base.list(this.failures);
      Base.consoleLog();
    }
    // passes
    fmt =
      color('bright pass', ' ') +
      color('light', ` %d passing ${Base.symbols.ok}`) +
      color('cyan', ' (%s)');
  
    Base.consoleLog(fmt, stats.passes || 0, milliseconds(stats.duration));
  
    // pending
    if (stats.pending) {
      fmt = color('pending', ' ') + color('pending', ` %d pending ${Base.symbols.time}`);
      Base.consoleLog(fmt, stats.pending);
    }
  
    // failures
    if (stats.failures) {
      fmt = color('error title', `  %d failing ${Base.symbols.err}`);
      Base.consoleLog(fmt, stats.failures);
     // Base.list(this.failures);
     // Base.consoleLog();
    }
  
    Base.consoleLog();
  }
  
  var self = this;
  var indents = 0;
  var n = 0;

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on(EVENT_RUN_BEGIN, function() {
    Base.consoleLog();
  });

  runner.on(EVENT_SUITE_BEGIN, function(suite) {
    ++indents;
    Base.consoleLog(color('cyan', '%s%s'), indent(), suite.title);
  });

  runner.on(EVENT_SUITE_END, function() {
    --indents;
    if (indents === 1) {
      Base.consoleLog();
    }
  });

  runner.on(EVENT_TEST_PENDING, function(test) {
    var fmt = indent() + color('pending', '  - %s');
    Base.consoleLog(fmt, test.title);
  });

  runner.on(EVENT_TEST_PASS, function(test) {
    var fmt;
    if (test.speed === 'fast') {
      fmt =
        indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s');
      Base.consoleLog(fmt, test.title);
    } else {
      fmt =
        indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)');
      Base.consoleLog(fmt, test.title, test.duration);
    }
  });

  runner.on(EVENT_TEST_FAIL, function(test) {
    Base.consoleLog(indent() + color('error title', `  ${Base.symbols.err}  FAILED (%d) %s`), ++n, test.title);
  });

  runner.once(EVENT_RUN_END, self.epilogue.bind(self));
}

// To have this reporter "extend" a built-in reporter uncomment the following line:
 