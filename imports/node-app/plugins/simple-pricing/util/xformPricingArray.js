import { assoc, compose, map, toPairs } from "ramda";

// add `currencyCode` keys to each pricing info object
const xformPricingEntry = ([k, v]) => compose(assoc("currencyCode", k))(v);

// map over all provided pricing info, provided in the format stored in our Catalog collection,
// and convert them to an array
export default compose(map(xformPricingEntry), toPairs);
