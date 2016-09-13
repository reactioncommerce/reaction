const yaml = require("js-yaml");
const fs   = require("fs");


const testSettings = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml" , "utf8"));
const browserType = testSettings.browser;

exports.config = {
  updateJob: false,
  specs: [
    /**
    "./tests/acceptance-tests/test/specs/dashboard-permissions.app-test.js",
    "./tests/acceptance-tests/test/specs/paypal-refund.app-test.js",
    "./tests/acceptance-tests/test/specs/stripe-refund.app-test.js",
    "./tests/acceptance-tests/test/specs/logged-in-stripe-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/guest-stripe-checkout.app-test.js",
    **/
    /**
    "./tests/acceptance-tests/test/specs/authorizenet-void.app-test.js",
    "./tests/acceptance-tests/test/specs/braintree-void.app-test.js",
    "./tests/acceptance-tests/test/specs/example-payment-refund.app-test.js",
    "./tests/acceptance-tests/test/specs/guest-braintree-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/guest-authorizenet-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/guest-example-payment-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/guest-paypal-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/logged-in-authorizenet-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/logged-in-braintree-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/logged-in-example-payment-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/logged-in-paypal-checkout.app-test.js",
    "./tests/acceptance-tests/test/specs/authorizenet-refund.app-test.js",
    "./tests/acceptance-tests/test/specs/braintree-refund.app-test.js",
    **/
    "./tests/acceptance-tests/test/specs/simple-login.app-test.js"
  ],
  exclude: [],

  capabilities: [{
    browserName: browserType
  }],

  logLevel: "verbose",
  coloredLogs: true,
  // screenshotPath: "./errorShots/",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 999999
  }
};
