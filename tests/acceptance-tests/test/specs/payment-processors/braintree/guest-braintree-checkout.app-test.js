"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;
const shopUser = require("../../../../lib/user-shop-actions.js");
const userDo = require("../../../../lib/basic-user-actions.js");
const getTestConfig = require("../../../../lib/get-test-config.js");

beforeEach(function () {
  getTestConfig.init();
});


describe("braintree guest checkout test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify guest can checkout with braintree", function () {
    browser.pause("5000");
    userDo.UserActions.refreshShop();
    browser.click(eleMap.product);
    browser.waitForEnabled(eleMap.red_option, 5000);
    browser.click(eleMap.red_option);
    browser.waitForEnabled(eleMap.add_to_cart, 5000);
    browser.click(eleMap.add_to_cart);
    browser.waitForEnabled(eleMap.checkout_btn, 5000);
    browser.click(eleMap.checkout_btn);
    browser.waitForEnabled(eleMap.continue_as_guest, 5000);
    browser.click(eleMap.continue_as_guest);
    shopUser.userAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.waitForEnabled(eleMap.braintree, 5000);
    browser.click(eleMap.braintree);
    shopUser.braintreePaymentInfo();
    browser.waitForEnabled(eleMap.braintree_complete_order_btn, 5000);
    browser.click(eleMap.braintree_complete_order_btn);
    browser.waitForVisible("#order-status", 10000);
    expect(browser.getText("#order-status")).to.equal("Your order is now submitted.");
  });
});
