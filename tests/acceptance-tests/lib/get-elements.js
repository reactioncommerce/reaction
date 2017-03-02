"use strict";

module.exports = {
  getElementByXpath: function (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  },
  getElementById: function (elem) {
    const grabElement = browser.execute(function (ele) {
      const elementStr = ele;
      const elementId = '[id^="' + elementStr + '-"]';
      return "#" + document.querySelector(elementId).id;
    }, elem);
    return grabElement;
  },
  retId: function (element) {
    return this.getElementById(element).value;
  }
};
