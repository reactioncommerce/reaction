import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Reaction } from "/server/api";
import { Templates } from "/lib/collections";

Meteor.publish("Templates", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  const marketplaceSettings = Reaction.getMarketplaceSettings();
  const shopId = Reaction.getShopId();

  const countSelector = query || {}; // The query selector we use for the Counts publication
  const findSelector = {}; // The query selector we'll use for the Templates publication

  // If we're using marketplace merchantTemplates we need to ensure we have a shopId and use the shopId in the selector
  if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantTemplates) {
    if (!shopId) {
      return this.ready();
    }

    // append shopId to query
    countSelector.shopId = shopId;
    findSelector.shopId = shopId;
  }

  // If we aren't using merchantTemplates, we'll share templates with the primary shop

  // Original comments
  // templates could be shared
  // if you disregarded shopId

  // appends a count to the collection
  // we're doing this for use with griddleTable
  Counts.publish(this, "templates-count", Templates.find(
    countSelector,
    options
  ));

  return Templates.find(findSelector);
});
