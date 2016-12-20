import { Reaction } from "/server/api";
import { Meteor } from "meteor/meteor";
import { Templates } from "/lib/collections";

Meteor.publish("Templates", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  const shopId = Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }

  const select = query || {};
  // append shopId to query
  // templates could be shared
  // if you disregarded shopId
  select.shopId = shopId;

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "templates-count", Templates.find(
    select,
    options
  ));

  return Templates.find({
    shopId
  });
});
