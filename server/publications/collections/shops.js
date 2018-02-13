import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

// We should be able to publish just the enabled languages/currencies/
Meteor.publish("PrimaryShop", () => {
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
  const enabled = settings.enabled;
  const shopsOfUser = Reaction.getShopsForUser(["admin"], this.userId);

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

  if (Reaction.marketplaceCurrency) {
    delete fields.currencies;
  }

  if (Reaction.marketplaceLanguages) {
    delete fields.languages;
  }

  if (Reaction.marketplaceLocales) {
    delete fields.locales;
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
