import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";


Meteor.methods({
  search: function (collection, searchString, maxResults) {
    check(collection, String);
    check(searchString, String);
    check(maxResults, Number);
  }
});
