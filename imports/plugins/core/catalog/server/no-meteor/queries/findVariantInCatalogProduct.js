/**
 * @summary Given a catalogProduct from the database, traverses it to find
 *   and return the variant or option with the given `variantId`. If it's
 *   an option, the `parentVariant` is also returned.
 * @param {Object} catalogProduct - The `product` property of a Catalog Item
 * @param {String} variantId - The variantId to look for
 * @returns {Object} Object with `variant` and `parentVariant` props.
 *   `variant` is the variant or option object with the requested variantId. It will
 *   also have a `parcel` object added to it, with inheritance from parent variant for options.
 *   If `variant` is an option, `parentVariant` will be set to the parent variant.
 */
export default function findVariantInCatalogProduct(catalogProduct, variantId) {
  let foundVariant = null;
  let parentVariant = null;

  catalogProduct.variants.forEach((variant) => {
    if (variant.options && variant.options.length) {
      variant.options.forEach((option) => {
        if (option.variantId === variantId) {
          // Build the `parcel` object, which should inherit (as a whole) from the parent variant
          let parcel;
          if (option.weight || option.height || option.width || option.length) {
            parcel = { weight: option.weight, height: option.height, width: option.width, length: option.length };
          } else if (variant.weight || variant.height || variant.width || variant.length) {
            parcel = { weight: variant.weight, height: variant.height, width: variant.width, length: variant.length };
          }
          foundVariant = {
            ...option,
            parcel
          };
          parentVariant = {
            ...variant
          };
          delete parentVariant.options;
        }
      });
    } else if (variant.variantId === variantId) {
      let parcel;
      if (variant.weight || variant.height || variant.width || variant.length) {
        parcel = { weight: variant.weight, height: variant.height, width: variant.width, length: variant.length };
      }
      foundVariant = {
        ...variant,
        parcel
      };
    }
  });

  return { parentVariant, variant: foundVariant };
}
