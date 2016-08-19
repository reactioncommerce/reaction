import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Logger } from "/server/api";
import { searchMethods } from "/imports/plugins/included/searchMongo/server";

const searchAbleCollections = _.keys(searchMethods);
Logger.info(searchAbleCollections);

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
