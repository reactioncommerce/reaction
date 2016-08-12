import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Logger } from "/server/api";
import { addProduct } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";

Fixtures();


Meteor.methods({
  "search": function (collection, searchString, maxResults) {
    check(collection, String);
    check(searchString, String);
    check(maxResults, Number);
  },
  "search/addProduct": function () {
    for (let x = 1; x < 20; x++) {
      const product = addProduct();
      Logger.info(product);
    }
  }
});
