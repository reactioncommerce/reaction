expect = require("chai").expect
webdriverjs = require("webdriverjs")
check = require("./check")
os = require("os")
fs = require("fs")
exec = require('child_process').exec

before (done) ->
  screenshotPath = os.tmpdir() + "/selenium-screenshots"
  try
    fs.statSync(screenshotPath)
  catch error
    if error.code == "ENOENT"
      fs.mkdirSync(screenshotPath)
  @client = webdriverjs.remote(
    desiredCapabilities:
      browserName: process.env.BROWSER || "chrome"
    logLevel: process.env.LOGLEVEL || "silent"
    screenshotPath: screenshotPath
  )
  @client.defer = ->
    @waitFor(".nonexistent", 300, () ->)
  @client.init()
  @client.implicitWait(3000, done)

beforeEach (done) ->
  exec(__dirname+"/../bin/reload", check (stdout, stderr) ->
    done()
  )

after (done) ->
  @client.end(done)

