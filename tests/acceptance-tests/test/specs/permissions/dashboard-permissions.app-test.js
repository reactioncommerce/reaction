"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;
const adminUser = require("../../../lib/basic-user-actions.js");
const resetUser = require("../../../lib/user-permissions-reset.js");
const getTestConfig = require("../../../../lib/get-test-config.js");

beforeEach(function () {
  getTestConfig.init();
});

afterEach(function () {
  resetUser.resetUserPermissions();
});

describe("dashboard permissions test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
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
