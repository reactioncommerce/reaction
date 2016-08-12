"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");
import snooze from "../../lib/snooze";
//let assert = require("assert");
// let expect = require("chai").expect;


describe("simple login test", function () {
  it("verify user is able to login", function () {
    let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));
    let usrData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
    browser.url("http://localhost:3000");
      // var elem = browser.element('span.product-image');
    snooze.snooze(5000, function () {
      browser.click(eleMap["login_dropdown_btn"]);
      browser.setValue(eleMap["login_email_fld"], usrData["admin_email"]);
      browser.setValue(eleMap["login_pw_fld"], usrData["admin_pw"]);
      browser.click(eleMap["login_btn"]);
      browser.pause("5000");
    });
  });
});
