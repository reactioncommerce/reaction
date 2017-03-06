"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;
const adminUser = require("../../../lib/basic-user-actions.js");
const getTestConfig = require("../../../lib/get-test-config.js");

beforeEach(function () {
  getTestConfig.init();
});


afterEach(function () {

});

describe("core permissions test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify admin adding dashboard permissions to guest", function () {
    adminUser.UserActions.userLogin("admin");
    // navigate to dashboard
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    browser.click(eleMap.db_accounts);
    browser.pause("5000");
    browser.click(eleMap.account_manage_btn);
    browser.pause("5000");
    browser.click(eleMap.perm_dashboard_chkb);
    browser.click(eleMap.perm_shop_settings_chkb);
    adminUser.UserActions.userLogout();
    adminUser.UserActions.userLogin("guest");
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    // verify Core settings option/button is present
    expect(browser.getText(eleMap.core_settings_btn_txt)).to.equal("Core");
    adminUser.UserActions.userLogout();
  });
});
