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


describe("braintree refund test", function () {
  let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
  it("verify user can refund with braintree", function () {
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
    browser.click(eleMap.braintree);
    browser.pause("6000");
    shopUser.braintreePaymentInfo();
    browser.pause("5000");
    browser.click(eleMap.braintree_complete_order_btn);
    browser.pause("6000");
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
    expect(browser.getText("h2"))
    .to.equal("Braintree does not allow refunds until transactions are settled. This can take up to 24 hours. Please try again later.");
    // error pop up ok btn
    browser.click("button.swal2-confirm.styled");
  });
});
