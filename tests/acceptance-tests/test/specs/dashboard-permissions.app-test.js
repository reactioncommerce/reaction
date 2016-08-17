"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let expect = require("chai").expect;
let adminUser = require("../../lib/basic-user-actions.js");
let resetUser = require("../../lib/user-permissions-reset.js")

beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});

afterEach(function () {
  resetUser.resetUserPermissions();
});

describe("dashboard permissions test", function () {
  let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify admin adding dashboard permissions to guest user", function () {
    adminUser.UserActions.userLogin("admin");
    // navigate to dashboard
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    // select guest user from user page
    browser.click(eleMap.db_accounts);
    browser.pause("5000");
    browser.click(eleMap.account_manage_btn);
    browser.pause("5000");
    browser.click(eleMap.perm_dashboard_chkb);
    browser.pause("5000");
    adminUser.UserActions.userLogout();
    browser.pause("5000");
    // login as guest user
    adminUser.UserActions.userLogin("guest");
    // user should be able to enter the dashboard now
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    expect(browser.getText(eleMap.dashboard_hdr_txt)).to.equal("Dashboard");
    adminUser.UserActions.userLogout();
  });
});
