import getPriceRange from "./getPriceRange.js";

/**
 *
 * @method getVariantPriceRange
 * @summary Create a Product PriceRange object by taking the lowest variant price and the highest variant
 * price to create the PriceRange. If only one variant use that variant's price to create the PriceRange
 * @param {String} variantId - A product variant ID.
 * @param {Object[]} variants - A list of documents from a Products.find call
 * @returns {Object} Product PriceRange object
 */
export default function getVariantPriceRange(variantId, variants) {
  const visibleOptions = variants.filter((option) => option.ancestors.includes(variantId) &&
    option.isVisible && !option.isDeleted);

  // all options include visible and hidden options. Deleted options are not considered
  const allOptions = variants.filter((option) => option.ancestors.includes(variantId) && !option.isDeleted);


  // If the variant has options and the options are hidden, return a price range of 0
  if (allOptions.length && visibleOptions.length === 0) {
    return getPriceRange([0]);
  }

  // If a variant has no visible options return price as it is
  // If price is not an object, get the PriceRange object
  if (visibleOptions.length === 0) {
    const thisVariant = variants.find((option) => option._id === variantId);
    const price = (thisVariant && thisVariant.price) || 0;
    if (typeof thisVariant.price === "object") {
      return price;
    }
    return getPriceRange([price]);
  }

  // If a variant has one or more visible options, calculate price range for all options
  const prices = visibleOptions.map((option) => option.price);
  return getPriceRange(prices);
}
