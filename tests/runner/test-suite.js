"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const suiteConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/test-suite-config.yml", "utf8"));

// but what if the user wants to just run one braintree test...
const braintreeSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/braintree/**/*.js"];

const stripeSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/stripe/**/*.js"];

const paypalSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/paypal/**/*.js"];

const authNetSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/authnet/**/*.js"];

const examplePaymentSpecs = ["./tests/acceptance-tests/test/specs/payment-processors/example/**/*.js"];

module.exports = {
  getToggles: function () {
    let toggles = [];
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
    }
    console.log("toggles", toggles);
    return toggles;
  }
};
