"use strict";
let sleep = require("./sleep");
let assert = require("assert");
// let expect = require("chai").expect;


describe("simple login test", function () {
  it("verify user is able to login", function () {
    browser.url("http://localhost:3000");
      // var elem = browser.element('span.product-image');
    sleep(5000, function () {
      browser.click("[data-event-action='accounts-dropdown-click']");
      browser.setValue("[class='form-control login-input-email']", "dwqmwgne@localhost");
      browser.setValue("[class='form-control login-input-password']", "of5fij0B");
      browser.click("[data-event-action='submitSignInForm']");
      browser.pause("5000");
      assert("//li/div/button");
    });
  });
});
