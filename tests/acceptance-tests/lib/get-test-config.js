"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

module.exports = {
  init: function () {
    const browserConfig = yaml.safeLoad(fs.readFileSync("../config/settings.yml", "utf8"));
    const baseUrl = browserConfig.base_url.toString();
    browser.url(baseUrl);
  }
};
