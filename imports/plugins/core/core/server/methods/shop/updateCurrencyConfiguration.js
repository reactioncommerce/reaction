import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "/imports/plugins/core/graphql/lib/ReactionError";
import { Shops } from "/lib/collections";

/**
 * @name shop/updateCurrencyConfiguration
 * @method
 * @memberof Shop/Methods
 * @summary enable / disable a currency
 * @param {String} currency - currency name | "all" to bulk enable / disable
 * @param {Boolean} enabled - true / false
 * @return {Number} returns mongo update result
 */
export default function updateCurrencyConfiguration(currency, enabled) {
  check(currency, String);
  check(enabled, Boolean);

  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();

  const shop = Shops.findOne({
    _id: Reaction.getShopId()
  });

  const defaultCurrency = shop.currency;

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
      _id: Reaction.getShopId()
    }, {
      $set: updateObject
    });
  } else if (currency === defaultCurrency) {
    return Shops.update({
      _id: Reaction.getShopId()
    }, {
      $set: {
        [`currencies.${currency}.enabled`]: true
      }
    });
  }

  return Shops.update({
    _id: Reaction.getShopId()
  }, {
    $set: {
      [`currencies.${currency}.enabled`]: enabled
    }
  });
}
