import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Shops } from "/lib/collections";

/**
 * @name shop/updateCurrencyConfiguration
 * @method
 * @memberof Shop/Methods
 * @summary enable / disable a currency
 * @param {String} currency - currency name | "all" to bulk enable / disable
 * @param {Boolean} enabled - true / false
 * @returns {Number} returns mongo update result
 */
export default function updateCurrencyConfiguration(currency, enabled) {
  check(currency, String);
  check(enabled, Boolean);

  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();

  const shopId = Reaction.getShopId();

  const shop = Shops.findOne({
    _id: shopId
  });

  const defaultCurrency = shop.currency;

  if (currency === defaultCurrency && !enabled) {
    throw new ReactionError("invalid-param", "Cannot disable the shop default currency");
  }

  if (currency === "all") {
    const updateObject = {};
    for (const currencyName in shop.currencies) {
      if ({}.hasOwnProperty.call(shop.currencies, currencyName) && currencyName !== "updatedAt") {
        if (currencyName === defaultCurrency) {
          updateObject[`currencies.${currencyName}.enabled`] = true;
        } else {
          updateObject[`currencies.${currencyName}.enabled`] = enabled;
        }
      }
    }

    return Shops.update({
      _id: shopId
    }, {
      $set: updateObject
    });
  }

  return Shops.update({
    _id: shopId
  }, {
    $set: {
      [`currencies.${currency}.enabled`]: enabled
    }
  });
}
