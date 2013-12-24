_ = require("underscore")
expect = require("chai").expect
webdriverjs = require("webdriverjs")

describe("my webdriverjs tests", ->
  @timeout(60000)
  client = {}
  before (done) ->
    client = webdriverjs.remote(
      desiredCapabilities:
        browserName: "chrome"
#      logLevel: "verbose"
    )
    client.init(->
      client.implicitWait(3000, done)
    )

  it "Login test", (done) ->
    client
      .url("http://localhost:3000/")
      .click("*=Sign In")
      .setValue("#login-email", "admin1@ongoworks.com")
      .setValue("#login-password", "ongo1")
      .buttonClick("#login-buttons-password")
      .click("*=Admin User1")
      .buttonClick("#login-buttons-logout")
      .element("*=Sign In", test())
      .call(done)

  after (done) ->
    client.end(done)
)

test = (callback) ->
  (error) ->
    if error then throw error
    if callback
      newArguments = _.toArray(arguments).slice(1)
      return callback.apply(@, newArguments)
