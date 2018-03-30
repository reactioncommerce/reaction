import { assoc, compose, map, toPairs } from "ramda";
import { Reaction } from "/server/api";

// add `code` and `_id` keys to each currency object
const xformCurrencyEntry = ([k, v]) => compose(
  assoc("code", k),
  assoc("_id", k)
)(v);

// map over all provided currencies, provided in the format stored in our Shops collection,
// and conver them to the format that GraphQL needs
const xformLegacyCurrencies = compose(map(xformCurrencyEntry), toPairs);

// retrive all currencies from the Shops collection and xform them
function getXformedCurrenciesByShop() {
  const shopCurrencies = Reaction.getShopCurrencies();

  return xformLegacyCurrencies(shopCurrencies);
}

// Find an individual xformed currency
export function getXformedCurrencyByCode(code) {
  const allCurrencies = getXformedCurrenciesByShop();
  return allCurrencies.find((currency) => currency.code === code);
}
