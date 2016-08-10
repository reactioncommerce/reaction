"use strict";
let assert = require("assert");
// let expect = require("chai").expect;

function sleep(time, callback) {
  let stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    ;
  }
  callback();
}

describe("simple login test", function () {
  it("verify user is able to login", function () {
    browser.url("http://localhost:3000");
      // var elem = browser.element('span.product-image');
    sleep(5000, function () {
      browser.click("[data-event-action='accounts-dropdown-click']");
      browser.setValue("[class='form-control login-input-email']", "t279teyv@localhost");
      browser.setValue("[class='form-control login-input-password']", "jq2YjzLd");
      browser.click("[data-event-action='submitSignInForm']");
      browser.pause("5000");
      assert("//li/div/button");
    });
  });
});
