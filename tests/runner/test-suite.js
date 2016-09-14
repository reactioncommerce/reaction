// create spec array here
// create a yml that allows users toggles for different tests suites braintree, authnet, stripe, etc.
//  based on the toggle, enable certain suites to be run
// add this file to *.conf.js so user doesn't have to enter test names manually everytime they add tests or change runners
"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const suiteConfig = yaml.safeLoad(fs.readFileSync("./test-suite-config.yml", "utf8"));


// "./tests/acceptance-tests/test/specs/dashboard-permissions.app-test.js",
// "./tests/acceptance-tests/test/specs/simple-login.app-test.js"

// but what if the user wants to just run one braintree test...
const braintreeSpecs = ["./tests/acceptance-tests/test/specs/braintree/**.js"];
/**
const braintreeSpecs = ["./tests/acceptance-tests/test/specs/braintree-void.app-test.js",
                        "./tests/acceptance-tests/test/specs/guest-braintree-checkout.app-test.js",
                        "./tests/acceptance-tests/test/specs/logged-in-braintree-checkout.app-test.js",
                        "./tests/acceptance-tests/test/specs/braintree-refund.app-test.js"
];
**/

const stripeSpecs = ["./tests/acceptance-tests/test/specs/guest-stripe-checkout.app-test.js",
                     "./tests/acceptance-tests/test/specs/logged-in-stripe-checkout.app-test.js",
                     "./tests/acceptance-tests/test/specs/stripe-refund.app-test.js"
];

const paypalSpecs = ["./tests/acceptance-tests/test/specs/paypal-refund.app-test.js",
                     "./tests/acceptance-tests/test/specs/guest-paypal-checkout.app-test.js",
                     "./tests/acceptance-tests/test/specs/logged-in-paypal-checkout.app-test.js"
];

const authNetSpecs = ["./tests/acceptance-tests/test/specs/authorizenet-void.app-test.js",
                     "./tests/acceptance-tests/test/specs/guest-authorizenet-checkout.app-test.js",
                     "./tests/acceptance-tests/test/specs/authorizenet-refund.app-test.js",
                     "./tests/acceptance-tests/test/specs/logged-in-authorizenet-checkout.app-test.js"
];

const examplePaymentSpecs = ["./tests/acceptance-tests/test/specs/example-payment-refund.app-test.js",
                             "./tests/acceptance-tests/test/specs/guest-example-payment-checkout.app-test.js",
                             "./tests/acceptance-tests/test/specs/logged-in-example-payment-checkout.app-test.js"
];

module.exports = {
  getToggles: function () {
    let toggles = [];
    if (suiteConfig.braintree === "true" || "True") {
      retArray.append(braintreeSpecs[0]);
    } if (suiteConfig.stripe === "true" || "True") {
      retArray.append(stripeSpecs);
    } if (suiteConfig.authnet === "true" || "True") {
      retArray.append(authNetSpecs);
    } if (suiteConfig.paypal === "true" || "True") {
      retArray.append(paypalSpecs);
    } if (suiteConfig.example === "true" || "True") {
      retArray.append(examplePaymentSpecs);
    }
    console.log(toggles);
    return toggles;
  }
};
