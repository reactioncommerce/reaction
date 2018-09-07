/**
 * Transform a product object into a partial representation of the Segment product schema.
 * Combine with `getVariantTrackingData(varaint)` to get the full definition
 * @name getProductTrackingData
 * @param {Object} product Project object
 * @returns {Object} Data for tracking
 */
export default function getProductTrackingData(product) {
  let price;
  let url;

  if (product) {
    if (product.shop) {
      const shopCurrency = product.shop.currency.code;
      const foundPricing = product.pricing.find((pricing) => pricing.currency.code === shopCurrency);

      if (foundPricing) {
        price = foundPricing.price || foundPricing.minPrice; // eslint-disable-line prefer-destructuring
      }
    }

    if (window.location.pathname) {
      url = window.location.pathname;
    }
  }

  return {
    product_id: product._id, // eslint-disable-line camelcase
    sku: product.sku,
    category: (product.tags && Array.isArray(product.tags.nodes) && product.tags.nodes.length && product.tags.nodes[0].name) || undefined,
    name: product.title,
    brand: product.vendor,
    currency: product.shop.currency.code,
    price,
    quantity: 1,
    value: price,
    image_url: product.primaryImage && product.primaryImage.URLs.original, // eslint-disable-line camelcase
    url
  };
}
