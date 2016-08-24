"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let expect = require("chai").expect;
let shopUser = require("../../lib/user-shop-actions.js");
let userDo = require("../../lib/basic-user-actions.js");
let adminUser = require("../../lib/admin-order-actions.js");


beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});


describe("paypal refund test", function () {
  let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can refund with paypal", function () {
    userDo.UserActions.userLogin("admin");
    browser.pause("5000");
    browser.click(eleMap.shop_btn);
    browser.pause("15000");
    browser.click(eleMap.product);
    browser.pause("5000");
    browser.click(eleMap.red_option);
    browser.pause("2000");
    browser.click(eleMap.add_to_cart_logged_in);
    browser.pause("2000");
    browser.click(eleMap.checkout_btn);
    browser.pause("5000");
    shopUser.checkForAddress();
    // free shipping option
    browser.click(eleMap.free_shipping);
    browser.pause("3000");
    browser.click(eleMap.paypal);
    browser.pause("6000");
    shopUser.paypalPaymentInfo();
    browser.pause("5000");
    browser.click(eleMap.paypal_complete_order_btn);
    // paypal takes forever 45sec wait
    browser.pause("45000");
    browser.click(eleMap.orders_page_btn);
    browser.pause("5000");
    browser.click(eleMap.first_order_new_btn);
    browser.pause("2000");
    browser.click(eleMap.approve_btn);
    browser.pause("2000");
    browser.click(eleMap.capture_payment_btn);
    adminUser.refundAmount();
    browser.click(eleMap.apply_refund_btn);
    browser.pause("5000");
    browser.click(eleMap.apply_refund_pop_up_btn);
    browser.pause("2000");
  });
});
