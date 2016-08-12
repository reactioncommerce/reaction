"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let assert = require("assert");
let expect = require("chai").expect;

beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig["base_url"].toString();
  browser.url(baseUrl);
});

describe("simple login test", function () {
  it("verify user is able to login", function () {
    let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
    let usrData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
    browser.pause("5000");
    browser.click(eleMap["login_dropdown_btn"]);
    browser.setValue(eleMap["login_email_fld"], usrData["admin_email"]);
    browser.setValue(eleMap["login_pw_fld"], usrData["admin_pw"]);
    browser.click(eleMap["login_btn"]);
    browser.pause("5000");
    browser.getText("#logged-in-display-name").then(function (text) {
      expect(assert(text === "Admin")).to.be.true;
    });
  });
});
