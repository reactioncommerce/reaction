import { assoc, compose, map, toPairs } from "ramda";
import { Meteor } from "meteor/meteor";

// add `code` and `_id` keys to each currency object
export const xformCurrencyEntry = ([k, v]) => compose(
  assoc("code", k),
  assoc("_id", k)
)(v);

// map over all provided currencies, provided in the format stored in our Shops collection,
// and convert them to the format that GraphQL needs
export const xformLegacyCurrencies = compose(map(xformCurrencyEntry), toPairs);

export function getXformedCurrenciesByShop(shop) {
  if (!shop || !shop.currencies) return [];
  return xformLegacyCurrencies(shop.currencies);
}

// retrive all currencies from the Shops collection and xform them
async function getXformedCurrenciesByShopId(context, shopId) {
  const shop = await context.collections.Shops.findOne({ _id: shopId });
  return getXformedCurrenciesByShop(shop);
}

// Find an individual xformed currency
export async function getXformedCurrencyByCode(context, shopId, code) {
  if (!code) return null;
  if (!shopId) throw new Meteor.Error("invalid", "shopId is required to build a Currency object");
  const allCurrencies = await getXformedCurrenciesByShopId(context, shopId);
  return allCurrencies.find((currency) => currency.code === code);
}
