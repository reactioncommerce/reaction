_ = require("underscore")
expect = require("chai").expect
webdriverjs = require("webdriverjs")
check = require("./check")

describe("Product variant", ->
  beforeEach (done) ->
    @client
      .url("http://localhost:3000/")
      .execute("Meteor.loginWithPassword('admin1@ongoworks.com', 'ongo1')")
      .waitFor(".all-subscriptions-loaded", 3000)
      .call(done)

  it "should display errors when price is not set", (done) ->
    @client
    .click(".product", check())
    .click("*=Clone last variant", check())
    .setValue("#variant-price", "", check())
    .click("#variants-modal .save-button", check())
    .getText(".has-error", check (text) ->
      expect(text).to.contain("Price is required")
    )
    .call(done)

  it "should display errors when option name or default value is not set", (done) ->
    @client
    .click(".product", check())
    .click("#edit-options", check())
    .defer()
    .click(".add-option-link", check())
    .click("#options-modal .save-button", check())
    .getText(".has-error", check (text) ->
      expect(text).to.contain("Name is required")
      expect(text).to.contain("Default value is required")
    )
    .call(done)

  it "should save normally when option name and default value are set #current", (done) ->
    @client
    .click(".product", check())
    .click("#edit-options", check())
    .defer()
    .click(".add-option-link", check())
    .setValue("#options-1-name", "New option", check())
    .setValue("#options-1-defaultValue", "some value", check())
    .click("#options-modal .save-button", check())
    .element(".has-error", (error, element) ->
      expect(error.type).to.equal("NoSuchElement")
    )
    .call(done)
)
