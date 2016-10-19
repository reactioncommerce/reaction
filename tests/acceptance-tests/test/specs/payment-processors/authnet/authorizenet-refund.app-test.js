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


describe("authorize net refund test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can refund with authorize net", function () {
    userDo.UserActions.userLogin("admin");
    browser.pause("5000");
    userDo.UserActions.refreshShop();
    browser.click(eleMap.product);
    browser.waitForEnabled(eleMap.red_option, 5000);
    browser.click(eleMap.red_option);
    browser.waitForEnabled(eleMap.add_to_cart_logged_in, 3000);
    browser.click(eleMap.add_to_cart_logged_in);
    browser.waitForEnabled(eleMap.checkout_btn);
    browser.click(eleMap.checkout_btn);
    shopUser.checkForAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.waitForEnabled(eleMap.authorizenet, 5000);
    browser.click(eleMap.authorizenet);
    shopUser.authorizeNetPaymentInfo();
    browser.click(eleMap.authorizenet_complete_order_btn);
    browser.pause("6000");
    // navigate to orders page
    browser.click(eleMap.orders_page_btn);
    browser.pause("5000");
    browser.click(eleMap.first_order_new_btn);
    browser.waitForEnabled(eleMap.approve_btn, 5000);
    browser.click(eleMap.approve_btn);
    browser.waitForEnabled(eleMap.capture_payment_btn, 2000);
    browser.click(eleMap.capture_payment_btn);
    adminUser.refundAmount();
    browser.click(eleMap.apply_refund_btn);
    browser.waitForEnabled(eleMap.apply_refund_pop_up_btn, 5000);
    browser.click(eleMap.apply_refund_pop_up_btn);
    browser.waitForVisible("h2", 5000);
    expect(browser.getText("h2"))
    .to.equal("Reaction does not yet support direct refund processing from Authorize.net. Please visit their web portal to perform this action.");
    // error pop up ok btn
    browser.click("button.swal2-confirm.styled");
  });
});
