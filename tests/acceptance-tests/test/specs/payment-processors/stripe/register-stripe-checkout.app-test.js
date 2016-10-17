"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;
const shopUser = require("../../../../lib/user-shop-actions.js");
const userDo = require("../../../../lib/basic-user-actions.js");


beforeEach(function () {
  const browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});


describe("stripe register user and checkout test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can register and checkout with stripe", function () {
    userDo.UserActions.registerUser();
    browser.pause("5000");
    userDo.UserActions.refreshShop();
    browser.click(eleMap.product);
    browser.waitForEnabled(eleMap.red_option, 5000);
    browser.click(eleMap.red_option);
    browser.waitForEnabled(eleMap.add_to_cart, 5000);
    browser.click(eleMap.add_to_cart);
    browser.waitForEnabled(eleMap.checkout_btn, 5000);
    browser.click(eleMap.checkout_btn);
    shopUser.checkForAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.waitForEnabled(eleMap.stripe, 5000);
    browser.click(eleMap.stripe);
    shopUser.stripePaymentInfo();
    browser.waitForEnabled(eleMap.stripe_complete_order_btn, 5000);
    browser.click(eleMap.stripe_complete_order_btn);
    browser.waitForVisible("#order-status", 10000);
    expect(browser.getText("#order-status")).to.equal("Your order is now submitted.");
  });
});
