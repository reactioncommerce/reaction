"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;

beforeEach(function () {
  const browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});

describe("simple login test", function () {
  it("verify user is able to login - and verifies user name in dropdown", function () {
    const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
    const usrData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
    browser.pause("5000");
    browser.click(eleMap.login_dropdown_btn);
    browser.setValue(eleMap.login_email_fld, usrData.admin_email);
    browser.setValue(eleMap.login_pw_fld, usrData.admin_pw);
    browser.click(eleMap.login_btn);
    browser.pause("5000");
    expect(browser.getText("#logged-in-display-name")).to.equal("Admin");
  });
});
