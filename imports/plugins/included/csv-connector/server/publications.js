import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import { Counts } from "meteor/tmeasday:publish-counts";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { JobItems, Mappings } from "../lib/collections";

/**
 * Security
 * Security definitions
 */
Security.permit(["insert", "update", "remove"]).collections([
  JobItems,
  Mappings
]).ifHasRole({
  role: "admin",
  group: Reaction.getShopId()
});

/**
 * JobItems
 */
Meteor.publish("JobItems", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};
  const sort = options || { sort: { uploadedAt: -1 } };

  select.shopId = shopId;

  Counts.publish(this, "job-items-count", JobItems.find(
    select,
    sort
  ));
  return JobItems.find(
    select,
    sort
  );
});

/**
 * Mappings
 */
Meteor.publish("Mappings", function (query, params) {
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

  return Mappings.find(
    select,
    options
  );
});
