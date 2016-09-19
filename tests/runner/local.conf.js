const yaml = require("js-yaml");
const fs   = require("fs");
const testSuite = require("./test-suite.js");


const testSettings = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
const browserType = testSettings.browser;

const getSpecs = testSuite.getToggles();
const getResult = testSuite.getResults();

exports.config = {
  updateJob: false,
  specs: getSpecs,
  exclude: [],

  capabilities: [{
    maxInstances: 1,
    browserName: browserType
  }],

  logLevel: "silent",
  coloredLogs: true,
  // screenshotPath: "./errorShots/",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 999999
  },
  reporters: getResult,
  reporterOptions: {
    allure: {
      outputDir: "allure-results"
    }
  }
};
