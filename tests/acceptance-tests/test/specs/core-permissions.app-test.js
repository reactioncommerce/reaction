"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let expect = require("chai").expect;
let adminUser = require("../../lib/basic-user-actions.js");

beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});

describe("core permissions test", function () {
  let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify admin adding dashboard permissions to guest", function () {
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
  });

  it("verify admin able to give core permissions to guest", function () {
    adminUser.UserActions.userLogin("admin");
    // navigate to dashboard
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    browser.click(eleMap.db_accounts);
    browser.pause("5000");
    browser.click(eleMap.account_manage_btn_in_group);
    browser.pause("5000");
    browser.click(eleMap.perm_shop_settings_chkb);
    adminUser.UserActions.userLogout();
    adminUser.UserActions.userLogin("guest");
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    // verify Core settings option/button is present
    expect(browser.getText(eleMap.core_settings_btn_txt)).to.equal("Core");
    // verify Orders option/button is present
    expect(browser.getText(eleMap.orders_settings_btn_txt)).to.equal("Orders");
    // verify Shipping settings option/button is present
    expect(browser.getText(eleMap.shipping_settings_btn_txt)).to.equal("Shipping");
    // verify Account settings option/button is present
    expect(browser.getText(eleMap.account_settings_btn_txt)).to.equal("Accounts");
    // verify catalog settings option/button is present
    expect(browser.getText(eleMap.catalog_settings_btn_txt)).to.equal("Catalog");
  });
});
