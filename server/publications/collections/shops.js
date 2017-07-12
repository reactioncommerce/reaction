import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

// We should be able to publish just the enabled languages/currencies/
Meteor.publish("PrimaryShop", function () {
  return Shops.find({
    shopType: "primary"
  }, {
    fields: {},
    limit: 1
  });
});

Meteor.publish("MerchantShops", function () {
  const domain = Reaction.getDomain();
  const settings = Reaction.getMarketplaceSettings();
  const enabled = settings.marketplaceEnabled;

  // If marketplace is disabled, don't return any merchant shops
  if (!enabled) {
    return this.ready();
  }

  // Don't publish currencies, languages, or locales for merchant shops.
  // We'll get that info from the primary shop.
  const fields = {
    languages: 0,
    locales: 0,
    currencies: 0
  };

  // Return all non-primary shops for this domain that are active
  return Shops.find({
    domains: domain,
    shopType: {
      $ne: "primary"
    },
    active: true
  }, {
    fields
  });
});


/**
 * Shops publication
 * @returns {Object} shop - current shop cursor
 */
Meteor.publish("Shops", function () {
  return Reaction.getCurrentShopCursor();
});
