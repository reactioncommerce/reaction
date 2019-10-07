import getPriceRange from "./getPriceRange.js";

/**
 * @summary Get the pricing object
 * @param {Object} doc The Products collection document
 * @param {Object} priceInfo A price range object, with `range`, `min`, and `max` fields
 * @returns {Object} Object for `pricing` field for product, variant, or option
 */
function getPricingObject(doc, priceInfo) {
  return {
    compareAtPrice: doc.compareAtPrice || null,
    displayPrice: priceInfo.range,
    maxPrice: priceInfo.max,
    minPrice: priceInfo.min,
    price: typeof doc.price === "number" ? doc.price : null
  };
}

/**
 * @summary Functions of type "publishProductToCatalog" are expected to mutate the provided catalogProduct.
 *   This function is called every time a product is published to a catalog.
 * @param {Object} catalogProduct The catalog product being built, to save in the Catalog collection. Mutates this.
 * @param {Object} input Input object
 * @param {Object} input.product The product being published, in Products collection schema
 * @param {Object} input.shop The shop that owns the product being published, in Shops collection schema
 * @param {Object[]} input.variants All variants and options of the product being published, in Products collection schema
 * @returns {undefined} No return. Mutates `catalogProduct` object.
 */
export default function publishProductToCatalog(catalogProduct, { product, shop, variants }) {
  const shopCurrencyCode = shop.currency;
  const shopCurrencyInfo = shop.currencies[shopCurrencyCode];

  const prices = [];

  for (const variant of catalogProduct.variants) {
    const { options } = variant;

    const sourceVariant = variants.find((productVariant) => productVariant._id === variant.variantId);
    if (!sourceVariant) throw new Error(`Variant ${variant.variantId} not found in variants list`);

    let variantPriceInfo;
    if (Array.isArray(options) && options.length) {
      const optionPrices = [];
      for (const option of options) {
        const sourceOptionVariant = variants.find((productVariant) => productVariant._id === option.variantId);
        if (!sourceOptionVariant) throw new Error(`Variant ${option.variantId} not found in variants list`);

        optionPrices.push(sourceOptionVariant.price);
        const optionPriceInfo = getPriceRange([sourceOptionVariant.price], shopCurrencyInfo);

        // Mutate the option, adding pricing field
        option.pricing = {
          [shopCurrencyCode]: getPricingObject(sourceOptionVariant, optionPriceInfo)
        };
      }
      variantPriceInfo = getPriceRange(optionPrices, shopCurrencyInfo);
    } else {
      variantPriceInfo = getPriceRange([sourceVariant.price], shopCurrencyInfo);
    }
    prices.push(variantPriceInfo.min, variantPriceInfo.max);

    // Mutate the variant, adding pricing field
    variant.pricing = {
      [shopCurrencyCode]: getPricingObject(sourceVariant, variantPriceInfo)
    };
  }

  const productPriceInfo = getPriceRange(prices, shopCurrencyInfo);

  // Mutate the product, adding pricing field
  catalogProduct.pricing = {
    [shopCurrencyCode]: getPricingObject(product, productPriceInfo)
  };

  // Make extra sure the product price is always `null`
  catalogProduct.pricing[shopCurrencyCode].price = null;
}
