"use strict";

module.exports = {
  visaGenerate: function () {
    const newCardArr = [];
    for (let i = 0; i < 16; i++) {
      newCardArr.push(Math.floor((Math.random() * 9)));
    }
    newCardArr[0] = 4;
    const cardNumber = newCardArr.join("");
    return cardNumber;
  }
};
