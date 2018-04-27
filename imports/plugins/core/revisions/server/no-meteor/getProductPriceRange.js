import getTopVariants from "./getTopVariant";
import getVariantPriceRange from "./getVariantPriceRange";

/**
 * TODO
 * @method
 * @summary
 * @param {String} productId
 * @param {Object} collections
 * @return {Promise<Object>}
 */
export default async function getProductPriceRange(productId, collections) {
  const { Products } = collections;
  const product = await Products.findOne(productId);
  if (!product) {
    return {
      range: "0",
      min: 0,
      max: 0
    };
  }

  const variants = await getTopVariants(product._id, collections);
  if (variants.length > 0) {
    const variantPrices = [];
    await Promise.all(
      variants.map(async (variant) => {
        if (variant.isVisible === true) {
          const range = await getVariantPriceRange(variant._id, collections);
          if (typeof range === "string") {
            const firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
            const lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
            variantPrices.push(firstPrice, lastPrice);
          } else {
            variantPrices.push(range);
          }
        } else {
          variantPrices.push(0, 0);
        }
      })
    );

    const priceMin = variantPrices.reduce((currentMin, price) => (price < currentMin ? price : currentMin), Infinity);
    const priceMax = variantPrices.reduce((currentMax, price) => (price > currentMax ? price : currentMax), 0);

    let priceRange = `${priceMin} - ${priceMax}`;
    // if we don't have a range
    if (priceMin === priceMax) {
      priceRange = priceMin.toString();
    }
    const priceObject = {
      range: priceRange,
      min: priceMin,
      max: priceMax
    };
    return priceObject;
  }

  if (!product.price) {
    return {
      range: "0",
      min: 0,
      max: 0
    };
  }

  // if we have no variants subscribed to (client)
  // we'll get the price object previously from the product
  return product.price;
}
