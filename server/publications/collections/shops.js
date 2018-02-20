import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

// We should be able to publish just the enabled languages/currencies/
Meteor.publish("PrimaryShop", () => Shops.find({
  shopType: "primary"
}, {
  fields: {},
  limit: 1
}));

Meteor.publish("MerchantShops", function (shopsOfUser = Reaction.getShopsForUser(["admin"], this.userId)) {
  check(shopsOfUser, Array);

  const domain = Reaction.getDomain();
  const { enabled } = Reaction.getMarketplaceSettings();
  // Don't publish currencies, languages, or locales for merchant shops.
  // We'll get that info from the primary shop.
  const fields = {
    languages: 0,
    locales: 0,
    currencies: 0
  };

  if (Reaction.marketplaceCurrency) {
    delete fields.currencies;
  }

  if (Reaction.marketplaceLanguages) {
    delete fields.languages;
  }

  if (Reaction.marketplaceLocales) {
    delete fields.locales;
  }

  // If marketplace is disabled, don't return any merchant shops
  if (!enabled) {
    return this.ready();
  }


  const selector = {
    domains: domain,
    shopType: {
      $ne: "primary"
    },
    $or: [
      {
        _id: {
          $in: shopsOfUser
        }
      },
      {
        "workflow.status": "active"
      }
    ]
  };

  // Return all non-primary shops for this domain that belong to the user
  // or are active
  return Shops.find(selector, { fields });
});
