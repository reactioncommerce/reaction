expect = require("chai").expect
webdriverjs = require("webdriverjs")
os = require("os")
fs = require("fs")

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
  @client.init()
  @client.implicitWait(3000, done)

after (done) ->
  @client.end(done)

