"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let adminUser = require("./basic-user-actions.js");

module.exports = {
  resetUserPermissions: function () {
    let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
    // reset user permissions back to guest
    adminUser.UserActions.userLogin("admin");
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    browser.click(eleMap.db_accounts);
    browser.pause("5000");
    browser.click(eleMap.account_manage_btn_in_group);
    browser.pause("5000");
    if (browser.getValue(eleMap.perm_dashboard_chkb) === "on") {
      browser.click(eleMap.perm_dashboard_chkb);
      console.log("first_box", browser.getValue(eleMap.perm_dashboard_chkb));
    }
    if (browser.getValue(eleMap.perm_shop_settings_chkb) === "on") {
      browser.click(eleMap.perm_shop_settings_chkb);
      console.log("second_box", browser.getValue(eleMap.perm_shop_settings_chkb));
    }
  }
};
