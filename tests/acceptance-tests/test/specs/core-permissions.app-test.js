"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
let expect = require("chai").expect;

beforeEach(function () {
  let browserConfig = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/settings.yml", "utf8"));
  const baseUrl = browserConfig.base_url.toString();
  browser.url(baseUrl);
});

describe("core permissions test", function () {
  it("admin adding permissions", function () {

  });
});
