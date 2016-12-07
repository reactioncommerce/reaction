import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Discounts } from "../../lib/collections";
import { Reaction } from "/server/api";

/**
 * Discounts
 * @type {Publication}
 * @param {Object} query
 * @param {Object} options
 */
Meteor.publish("Discounts", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  // check shopId
  const shopId = Reaction.getShopId();
  if (!shopId && query) {
    return this.ready();
  }

  const select = query || {};
  // append shopId to query
  // applicable discounts are published
  // for this users cartId;
  select.shopId = shopId;
  // select.cartId = cartId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "discounts-count", Discounts.find(
    select,
    options
  ));

  return Discounts.find(
    select,
    options
  );
});
