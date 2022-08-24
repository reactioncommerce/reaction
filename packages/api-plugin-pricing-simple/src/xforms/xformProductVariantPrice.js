import Logger from "@reactioncommerce/logger";

export default (node) => {
  let { price } = node;
  // If a variant has options, then its price will become an object
  // that includes the following props: min, max and range. This change
  // in the underlying data structure will break the API as the variant
  // field `price` will attempt to return an `Object` for a field that previously
  // expected a `Float`. This field resolver mitigates this problem by returning
  // a `Float` as expected. This will prevent the API and UI from breaking. Further,
  // this field, is now deprecated in favor of the new `pricing` field.
  if (typeof price === "object") {
    price = null;
  }

  Logger.warn("Using deprecated field `price` on type `ProductVariant`, please use field `pricing` instead.");

  return price;
};
