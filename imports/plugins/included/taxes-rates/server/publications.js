import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import { Counts } from "meteor/tmeasday:publish-counts";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Taxes } from "../lib/collections";

//
// Security
// Security definitions
//
Security.permit(["insert", "update", "remove"]).collections([
  Taxes
]).ifHasRole({
  role: "admin",
  group: Reaction.getShopId()
});

/**
 * taxes
 */
Meteor.publish("Taxes", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const select = query || {};
  // append shopId to query
  // taxes could be shared
  // if you disregarded shopId
  select.shopId = shopId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "taxes-count", Taxes.find(
    select,
    options
  ));

  return Taxes.find(
    select,
    options
  );
});
