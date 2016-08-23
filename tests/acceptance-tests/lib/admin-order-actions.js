"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");

let userData = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/config/user-data.yml", "utf8"));
let eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));

module.exports = {
  refundAmount: function () {
    let captTotal = browser.getText(eleMap.captured_total);
    console.log(captTotal);
    browser.pause("2000");
    browser.setValue(eleMap.refund_amnt_txt_box, captTotal);
    browser.pause("7000");
  }
};
