import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import { Logger } from "/server/api";
import { searchMethods } from "/imports/plugins/included/search-mongo/server";

const searchPackage = Packages.findOne({ provides: "searchEngine"});
Logger.warn(searchPackage);
// const searchMethods = require(searchPackage.importPath);

const searchAbleCollections = _.keys(searchMethods);
Logger.warn(searchAbleCollections);

Meteor.methods({
  search: function (collection = "product", searchString, maxResults, stopOnExactMatch = false) {
    check(collection, Match.Optional(String));
    // check(collections, Match.OneOf(searchAbleCollections));
    check(searchString, String);
    check(maxResults, Match.Optional(Number));
    Logger.info(`Initiating Search for ${searchString} in ${collection} collection`);
    return searchMethods[collection](searchString, maxResults, stopOnExactMatch);
  }
});
