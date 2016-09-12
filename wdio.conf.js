const browserstack = require("browserstack-local");

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || "BROWSERSTACK_USERNAME",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",

  updateJob: false,
  specs: [
    "./tests/acceptance-tests/test/specs/simple-login.app-test.js"
  ],
  exclude: [],

  capabilities: [{
    browser: "chrome",
    // name: "local_test",
    // build: "webdriver-browserstack",
    "browserstack.local": true,
    "browserstack.debug": true
  }],

  logLevel: "verbose",
  coloredLogs: true,
  screenshotPath: "./errorShots/",
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
