"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");
const shopUser = require("../../lib/user-shop-actions.js");
const userDo = require("../../lib/basic-user-actions.js");
const adminUser = require("../../lib/admin-order-actions.js");


beforeEach(function () {
  const browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});


describe("stripe refund test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can refund with stripe", function () {
    userDo.UserActions.userLogin("admin");
    browser.pause("5000");
    userDo.UserActions.refreshShop();
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
    browser.click(eleMap.stripe);
    browser.pause("6000");
    shopUser.stripePaymentInfo();
    browser.pause("5000");
    browser.click(eleMap.stripe_complete_order_btn);
    browser.pause("9000");
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
