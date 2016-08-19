"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let expect = require("chai").expect;
let shopUser = require("../../lib/user-shop-actions.js");
let userDo = require("../../lib/basic-user-actions.js");


beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});


describe("authorize net logged in checkout test", function () {
  let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify logged in user can checkout with authorize net", function () {
    userDo.UserActions.userLogin("guest");
    browser.pause("5000");
    browser.click(eleMap.shop_btn);
    browser.pause("15000");
    browser.click(eleMap.product);
    browser.pause("5000");
    browser.click(eleMap.red_option);
    browser.pause("2000");
    browser.click(eleMap.add_to_cart);
    browser.pause("2000");
    browser.click(eleMap.checkout_btn);
    browser.pause("5000");
    shopUser.checkForAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.pause("3000");
    browser.click(eleMap.authorizenet);
    browser.pause("6000");
    shopUser.authorizeNetPaymentInfo();
    browser.click(eleMap.authorizenet_complete_order_btn);
    browser.pause("6000");
    expect(browser.getText("#order-status")).to.equal("Your order is now submitted.");
  });
});
