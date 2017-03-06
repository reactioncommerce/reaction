import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Shipping } from "/lib/collections";
import { Reaction } from "/server/api";
/**
 * shipping
 */

Meteor.publish("Shipping", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  const select = query || {};
  select.shopId = shopId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "shipping-count", Shipping.find(
    select,
    options
  ));

  return Shipping.find(
    select,
    options
  );
});
