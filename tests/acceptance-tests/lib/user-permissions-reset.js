"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let adminUser = require("./basic-user-actions.js");

module.exports = {
  resetUserPermissions: function () {
    let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
    adminUser.UserActions.userLogin("admin");
    browser.click(eleMap.dashboard_btn);
    browser.pause("5000");
    browser.click(eleMap.db_accounts);
    browser.pause("5000");
    browser.click(eleMap.account_manage_btn_in_group);
    browser.pause("5000");
    let dashboardCheckbox = browser.element(eleMap.perm_dashboard_chkb);
    let dashboardCheckboxValue = dashboardCheckbox.getValue();
    if (dashboardCheckboxValue === "on") {
      browser.click(eleMap.perm_dashboard_chkb);
    }
    let shopSettingsCheckbox = browser.element(eleMap.perm_shop_settings_chkb);
    let shopSettingsCheckboxValue = shopSettingsCheckbox.getValue();
    if (shopSettingsCheckboxValue === "on") {
      browser.click(eleMap.perm_shop_settings_chkb);
    }
  }
};
