/**
 * @summary Mutates a new top-level Product being created
 * @param {Object} variant Variant product object to mutate
 * @returns {undefined}
 */
export default function mutateNewVariantBeforeCreate(variant) {
  if (!variant.price) variant.price = 0;
}
