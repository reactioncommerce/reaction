"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const userData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));

module.exports = {
  userAddress: function () {
    browser.pause("5000");
    browser.waitForEnabled(eleMap.country_dd, 6000);
    browser.selectByValue(eleMap.country_dd, userData.country);
    browser.setValue("input[name='fullName']", userData.name);
    browser.setValue("input[name='address1']", userData.address1);
    browser.setValue("input[name='postal']", userData.postal);
    browser.setValue("input[name='city']", userData.city);
    browser.pause("3000");
    browser.selectByValue("select[name='region']", userData.region);
    browser.setValue("input[name='phone']", userData.phone);
    browser.click(eleMap.save_and_continue_btn);
    browser.pause("5000");
  },
  authorizeNetPaymentInfo: function () {
    browser.waitForEnabled(eleMap.authorizenet_cc, 6000);
    try {
      browser.setValue(eleMap.authorizenet_cc, userData.visa);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
    browser.pause("5000");
    browser.selectByValue("select[name='expireMonth']", userData.exp_month);
    browser.selectByValue("select[name='expireYear']", userData.exp_year);
    browser.waitForEnabled(eleMap.authorizenet_cvv, 8000);
    try {
      browser.setValue(eleMap.authorizenet_cvv, userData.cvv);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
  },
  braintreePaymentInfo: function () {
    browser.waitForEnabled(eleMap.braintree_cc, 6000);
    browser.setValue(eleMap.braintree_cc, userData.visa);
    browser.pause("5000");
    browser.selectByValue(eleMap.braintree_exp_month, userData.exp_month);
    browser.selectByValue(eleMap.braintree_exp_year, userData.exp_year);
    browser.waitForEnabled(eleMap.braintree_cvv, 8000);
    try {
      browser.setValue(eleMap.braintree_cvv, userData.cvv);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
  },
  examplePaymentInfo: function () {
    browser.pause(6000);
    browser.setValue(eleMap.example_payment_cc, userData.visa);
    browser.pause("5000");
    browser.selectByValue(eleMap.example_payment_exp_month, userData.exp_month);
    browser.selectByValue(eleMap.example_payment_exp_year, userData.exp_year);
    browser.waitForEnabled(eleMap.example_payment_cvv, 8000);
    try {
      browser.setValue(eleMap.example_payment_cvv, userData.cvv);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
  },
  paypalPaymentInfo: function () {
    browser.pause(6000);
    browser.setValue(eleMap.paypal_cc, userData.paypal_visa);
    browser.pause("5000");
    browser.selectByValue(eleMap.paypal_exp_month, userData.exp_month);
    browser.selectByValue(eleMap.paypal_exp_year, userData.exp_year);
    browser.waitForEnabled(eleMap.paypal_cvv, 8000);
    try {
      browser.setValue(eleMap.paypal_cvv, userData.cvv);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
  },
  stripePaymentInfo: function () {
    browser.pause(6000);
    browser.setValue(eleMap.stripe_cc, userData.stripe_visa);
    browser.pause("5000");
    browser.selectByValue(eleMap.stripe_exp_month, userData.exp_month);
    browser.selectByValue(eleMap.stripe_exp_year, userData.exp_year);
    browser.waitForEnabled(eleMap.stripe_cvv, 8000);
    try {
      browser.setValue(eleMap.stripe_cvv, userData.cvv);
    } catch (e) {
      browser.pause("1");
    } finally {
      browser.pause("1000");
    }
  },
  checkForAddress: function () {
    browser.pause("2000");
    if (browser.isExisting("address")) {
      browser.pause("1000");
    } else {
      this.userAddress();
    }
  }
};
