require('coffee-script')
var browserStderr = require('remote').getGlobal('process').stderr

var fs = require('fs-plus')
var path = require('path')
var remote = require('remote')
var TerminalReporter = require('jasmine-tagged').TerminalReporter

var hash = window.location.hash.slice(1)
var args = Object.freeze(JSON.parse(decodeURIComponent(hash)))

var run = function() {
  if (args.paths.length === 0){
    browserStderr.write('No paths specified\n')
    return exit(1)
  }

  reporter = new TerminalReporter({
    color: true,
    print: function(str) {
      log(str)
    },
    onComplete: function(runner) {
      if (runner.results().failedCount > 0)
        exit(1)
      else
        exit(0)
    }
  })

  requireSpecs(path.resolve(args.paths[0]))

  var jasmineEnv = jasmine.getEnv()
  jasmineEnv.addReporter(reporter)
  jasmineEnv.setIncludedTags([process.platform])
  jasmineEnv.execute()
}

var exit = function(status) {
  var app = remote.require('app')
  app.emit('will-exit')
  remote.process.exit(status)
}

var log = function(str) {
  // FIXME: UGH, writing to process.stdout fails, and process.stderr is silent
  // process.stdout.write(str)
  browserStderr.write(str)
}

var requireSpecs = function(specDirectory) {
  var fileList = fs.listTreeSync(specDirectory)
  for (var i = 0; i < fileList.length; i++){
    var specFilePath = fileList[i]
    if (/-spec\.(coffee|js)$/.test(specFilePath))
      require(specFilePath)
  }
}

run()