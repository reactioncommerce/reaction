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


describe("authorize net void test", function () {
  const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can void an order with authorize net", function () {
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
    adminUser.voidAmount();
    browser.click(eleMap.approve_btn);
    browser.waitForVisible("h2", 5000);
    expect(browser.getText("h2")).to.equal("Applying a 100% discount will void / cancel this order with your payment provider");
    browser.click(eleMap.apply_discount_btn);
    browser.waitForVisible(eleMap.order_total_post_discount, 5000);
    const getTotal = browser.getText(eleMap.order_total_post_discount);
    expect(getTotal[0]).to.equal("$0.00");
    browser.click(eleMap.capture_payment_btn);
    browser.pause("3000");
  });
});
