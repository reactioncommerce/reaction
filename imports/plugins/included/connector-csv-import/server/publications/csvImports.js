import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import { Counts } from "meteor/tmeasday:publish-counts";
import { ImportJobs, ImportMappings } from "../../lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * Security
 * Security definitions
 */
Security.permit(["insert", "update", "remove"]).collections([
  ImportJobs,
  ImportMappings
]).ifHasRole({
  role: "admin",
  group: Reaction.getShopId()
});

/**
 * importJobs
 */
Meteor.publish("ImportJobs", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};

  // append shopId to query
  select.shopId = shopId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "import-jobs-count", ImportJobs.find(
    select,
    options
  ));
  return ImportJobs.find(
    select,
    options
  );
});

/**
 * importMappings
 */
Meteor.publish("ImportMappings", function (query, params) {
  check(query, Match.Optional(Object));
  check(params, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};

  // append shopId to query
  select.shopId = shopId;

  const options = params || {};

  return ImportMappings.find(
    select,
    options
  );
});
