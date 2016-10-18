"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
const usrData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
const browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));

// default to process env if we've got that
const adminEmail = process.env.REACTION_EMAIL || usrData.admin_email;
const adminPassword = process.env.REACTION_AUTH || usrData.admin_pw;

module.exports = {
  UserActions: {
    userLogin: function (user) {
      browser.pause("5000");
      browser.click(eleMap.login_dropdown_btn);
      if (user === "admin") {
        browser.setValue(eleMap.login_email_fld, adminEmail);
        browser.setValue(eleMap.login_pw_fld, adminPassword);
      }
      if (user === "guest") {
        browser.setValue(eleMap.login_email_fld, usrData.guest_email);
        browser.setValue(eleMap.login_pw_fld, usrData.guest_pw);
      }
      browser.click(eleMap.login_btn);
      browser.pause("5000");
    },
    userLogout: function () {
      browser.click("#logged-in-display-name");
      browser.pause("5000");
      browser.click("#logout");
    },
    refreshShop: function () {
      browser.click(eleMap.shop_btn);
      browser.pause("10000");
      while (browser.isVisible("span.product-image") === false) {
        browser.refresh();
        browser.pause("2000");
        browser.click(eleMap.shop_btn);
        browser.pause("3000");
      }
    },
    registerUser: function () {
      const baseUrl = browserConfig.base_url.toString();
      const regUrl = baseUrl + "/reaction/account/profile";
      browser.url(regUrl);
      browser.pause(5000);
      const ep = (new Date).getTime();
      const email = ep + "email@reactioncommerce.com";
      browser.setValue(eleMap.pl_email_address_fld, email);
      browser.setValue(eleMap.pl_password_fld, usrData.guest_pw);
      browser.click(eleMap.pl_register_lnk);
      browser.pause(2000);
      browser.click(eleMap.pl_register_btn);
      browser.pause(2000);
    }
  }
};
