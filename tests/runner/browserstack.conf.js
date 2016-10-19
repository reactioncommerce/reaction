const browserstack = require("browserstack-local");
const yaml = require("js-yaml");
const fs   = require("fs");
const testSuite = require("./test-suite.js");

const testSettings = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
const getSpecs = testSuite.getToggles();
const getResult = testSuite.getResults();

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || "BROWSERSTACK_USERNAME",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",

  updateJob: false,
  specs: getSpecs,
  exclude: [],

  capabilities: [{
    "browserName": testSettings.browser,
    "browser_version": testSettings.browser_version,
    "os": testSettings.os,
    "os_version": testSettings.os_version,
    "resolution": testSettings.resolution,
    "browserstack.local": true,
    "browserstack.debug": true
  }],

  logLevel: "silent",
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
    // console.log("Connecting local");
    return new Promise(function (resolve, reject) {
      exports.bsLocal = new browserstack.Local();
      exports.bsLocal.start({"key": exports.config.key }, function (error) {
        if (error) return reject(error);
        // console.log("Connected. Now testing...");
        resolve();
      });
    });
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    try {
      exports.bs_local.stop(function () {});
    } catch (e) {
      // console.log("oops!");
    }
  },

  reporters: getResult,
  reporterOptions: {
    allure: {
      outputDir: "allure-results"
    }
  }
};
