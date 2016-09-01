"use strict";

module.exports = {
  getElementByXpath: function (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
};
