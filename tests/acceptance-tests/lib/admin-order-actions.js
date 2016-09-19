"use strict";
const yaml = require("js-yaml");
const fs   = require("fs");

const eleMap = yaml.safeLoad(fs.readFileSync("./tests/acceptance-tests/elements/element-map.yml", "utf8"));

module.exports = {
  refundAmount: function () {
    browser.waitForVisible(eleMap.captured_total, 2000);
    const captTotal = browser.getText(eleMap.captured_total);
    browser.waitForEnabled(eleMap.refund_amnt_txt_box, 20000);
    browser.setValue(eleMap.refund_amnt_txt_box, captTotal);
    browser.pause("7000");
  },
  voidAmount: function () {
    browser.waitForVisible(eleMap.order_total_w_tax, 20000);
    const captTotalWTax = browser.getText(eleMap.order_total_w_tax);
    // const orderTotal = browser.getText(eleMap.order_total);
    browser.pause("2000");
    browser.setValue(eleMap.discount_txt_box, captTotalWTax[0]);
    browser.pause("7000");
  }
};
