const browserstack = require("browserstack-local");
const yaml = require("js-yaml");
const fs   = require("fs");

const testSettings = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || "BROWSERSTACK_USERNAME",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",

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
    "browserName": testSettings.browser,
    "browser_version": testSettings.browser_version,
    "os": testSettings.os,
    "os_version": testSettings.os_version,
    // "os_version": toString(testSettings.os_version),
    "resolution": testSettings.resolution,
    "browserstack.local": true,
    "browserstack.debug": true
  }],

  logLevel: "verbose",
  coloredLogs: true,
  // screenshotPath: "./errorShots/",
  baseUrl: "http://localhost",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 999999
  },

  // Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log("Connecting local");
    return new Promise(function (resolve, reject) {
      exports.bsLocal = new browserstack.Local();
      exports.bsLocal.start({"key": exports.config.key }, function (error) {
        if (error) return reject(error);
        console.log("Connected. Now testing...");
        resolve();
      });
    });
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function () {});
  }
};
