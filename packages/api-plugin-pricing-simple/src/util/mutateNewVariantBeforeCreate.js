/**
 * @summary Mutates a new top-level Product being created
 * @param {Object} variant Variant product object to mutate
 * @returns {undefined}
 */
export default function mutateNewVariantBeforeCreateForSimplePricing(variant) {
  if (!variant.price) variant.price = 0;
  if (!variant.priceType) variant.priceType = "full";
}
