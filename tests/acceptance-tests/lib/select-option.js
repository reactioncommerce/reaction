"use strict";
let yaml = require("js-yaml");
let fs   = require("fs");

module.exports = {
  browser.addCommand('selectOption', function(selector, item, done) {
      this.selectorExecute(selector, function(elements, item) {
          var select = elements[0];
          for(var i in select.children) {
              var option = select.children[i];
              if(option.innerHTML === item) {
                  option.selected = true;
              }
          }
      }, item, done);
  })
};
