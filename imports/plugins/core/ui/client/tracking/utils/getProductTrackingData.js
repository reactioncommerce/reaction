/**
 * Transform a product object into a partial representation of the Segment product schema.
 * Combine with `getVariantTrackingData(varaint)` to get the full definition
 * @name getProductTrackingData
 * @param {Object} product Project object
 * @returns {Object} Data for tracking
 */
export default function getProductTrackingData(product) {
  let currency = "USD";
  let minPrice;
  let maxPrice;
  let url;

  if (product.pricing && product.pricing.length) {
    const price = product.pricing[0];
    minPrice = price.minPrice;
    maxPrice = price.maxPrice;
    currency = price.currency.code;
  }

  if (window.location.pathname) {
    url = window.location.pathname;
  }

  return {
    product_id: product._id, // eslint-disable-line camelcase
    sku: product.sku,
    category: (product.tags && Array.isArray(product.tags.nodes) && product.tags.nodes.length && product.tags.nodes[0].name) || undefined,
    name: product.title,
    brand: product.vendor,
    currency,
    minPrice,
    maxPrice,
    quantity: 1,
    value: minPrice,
    image_url: product.primaryImage && product.primaryImage.URLs.original, // eslint-disable-line camelcase
    url
  };
}
