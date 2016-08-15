import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Fixtures from "/server/imports/fixtures";

Fixtures();


Meteor.methods({
  search: function (collection, searchString, maxResults) {
    check(collection, String);
    check(searchString, String);
    check(maxResults, Number);
  }
});
