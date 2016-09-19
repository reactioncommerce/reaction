"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const suiteConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/test-suite-config.yml", "utf8"));

const braintreeSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/braintree/**/*.js"];

const stripeSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/stripe/**/*.js"];

const paypalSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/paypal/**/*.js"];

const authNetSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/authnet/**/*.js"];

const examplePaymentSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/example/**/*.js"];

const permissionSpecs = ["./tests/acceptance-tests/test/specs/permissions/**/*.js"];

const smokeTestSpecs = ["./tests/acceptance-tests/test/specs/smoke-tests/**/*.js"];

module.exports = {
  getToggles: function () {
    const toggles = [];
    if (suiteConfig.braintree === true) {
      toggles.push(braintreeSpecs[0]);
    } if (suiteConfig.stripe === true) {
      toggles.push(stripeSpecs[0]);
    } if (suiteConfig.authnet === true) {
      toggles.push(authNetSpecs[0]);
    } if (suiteConfig.paypal === true) {
      toggles.push(paypalSpecs[0]);
    } if (suiteConfig.example === true) {
      toggles.push(examplePaymentSpecs[0]);
    } if (suiteConfig.permissions === true) {
      toggles.push(permissionSpecs[0]);
    } if (suiteConfig.smoke_test === true) {
      toggles.push(smokeTestSpecs[0]);
    }
    return toggles;
  },
  getResults: function () {
    const allureArr = [];
    if (suiteConfig.allure === true) {
      allureArr.push("allure");
    }
    return allureArr;
  }
};
