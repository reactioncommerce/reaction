import { assoc, compose, map, toPairs } from "ramda";

const xformCurrencyEntry = ([k, v]) => compose(
  assoc("code", k),
  assoc("_id", k)
)(v);

export const xformLegacyCurrencies = compose(map(xformCurrencyEntry), toPairs);
