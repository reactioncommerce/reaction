import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

/**
 * @name shop/getCurrencyRates
 * @method
 * @memberof Shop/Methods
 * @summary It returns the current exchange rate against the shop currency
 * usage: Meteor.call("shop/getCurrencyRates","USD")
 * @param {String} currency code
 * @return {Number|Object} currency conversion rate
 */
export default function getCurrencyRates(currency) {
  check(currency, String);
  this.unblock();

  const field = `currencies.${currency}.rate`;
  const shop = Shops.findOne(Reaction.getShopId(), {
    fields: {
      [field]: 1
    }
  });

  return typeof shop.currencies[currency].rate === "number" &&
    shop.currencies[currency].rate;
}
