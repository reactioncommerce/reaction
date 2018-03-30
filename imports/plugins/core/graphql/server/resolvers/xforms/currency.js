import { assoc, compose, map, toPairs } from "ramda";
import { Reaction } from "/server/api";

// Trasform currency object.
const xformCurrencyEntry = ([k, v]) => compose(
  assoc("code", k),
  assoc("_id", k)
)(v);

const xformLegacyCurrencies = compose(map(xformCurrencyEntry), toPairs);

function getXformedCurrenciesByShop() {
  const shopCurrencies = Reaction.getShopCurrencies();

  return xformLegacyCurrencies(shopCurrencies);
}

export function getXformedCurrencyByCode(code) {
  const allCurrencies = getXformedCurrenciesByShop();
  return allCurrencies.find((currency) => currency.code === code);
}
