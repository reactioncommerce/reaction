const yaml = require("js-yaml");
const fs   = require("fs");
const testSuite = require("./test-suite.js");


const testSettings = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
const browserType = testSettings.browser;

const getSpecs = testSuite.getToggles();

exports.config = {
  updateJob: false,
  specs: getSpecs,
  // specs: ["./tests/acceptance-tests/test/specs/payment-processors/authnet/guest-authorizenet-checkout.app-test.js"],
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
