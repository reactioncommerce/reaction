"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const expect = require("chai").expect;
const shopUser = require("../../../../lib/user-shop-actions.js");
const userDo = require("../../../../lib/basic-user-actions.js");
const adminUser = require("../../../../lib/admin-order-actions.js");


beforeEach(function () {
  const browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});


describe("braintree refund test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can refund with braintree", function () {
    userDo.UserActions.userLogin("admin");
    browser.pause("5000");
    userDo.UserActions.refreshShop();
    browser.click(eleMap.product);
    browser.waitForEnabled(eleMap.red_option, 5000);
    browser.click(eleMap.red_option);
    browser.waitForEnabled(eleMap.add_to_cart_logged_in, 5000);
    browser.click(eleMap.add_to_cart_logged_in);
    browser.waitForEnabled(eleMap.checkout_btn, 5000);
    browser.click(eleMap.checkout_btn);
    shopUser.checkForAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.waitForEnabled(eleMap.braintree, 5000);
    browser.click(eleMap.braintree);
    shopUser.braintreePaymentInfo();
    browser.waitForEnabled(eleMap.braintree_complete_order_btn, 5000);
    browser.click(eleMap.braintree_complete_order_btn);
    browser.pause(5000);
    browser.click(eleMap.orders_page_btn);
    browser.pause("15000");
    browser.click(eleMap.first_order_new_btn);
    browser.waitForEnabled(eleMap.approve_btn, 10000);
    browser.click(eleMap.approve_btn);
    browser.waitForEnabled(eleMap.capture_payment_btn, 5000);
    browser.click(eleMap.capture_payment_btn);
    adminUser.refundAmount();
    browser.click(eleMap.apply_refund_btn);
    browser.pause(5000);
    browser.click(eleMap.apply_refund_pop_up_btn);
    browser.pause(5000);
    expect(browser.getText("h2"))
    .to.equal("Braintree does not allow refunds until transactions are settled. This can take up to 24 hours. Please try again later.");
    // error pop up ok btn
    browser.click("button.swal2-confirm.styled");
  });
});
