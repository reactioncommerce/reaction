//import routes from "routes";

/**
 * Transform a variant object into a partial representation of the Segment product schema
 * @name getVariantTrackingData
 * @param {Object} data Object containing data for tracking a variant
 * @param {Object} data.product Parent product of the selected variant
 * @param {Object} data.variant Object of the selected variant
 * @param {Object} [data.optionId] Id of the selected option
 * @returns {Object} Data sutable for trackign a variant
 */
export default function getVariantTrackingData({ product, variant, optionId }) {
  let data = variant;
  let imageURL;
  let price;
  let url;

  // If an option id is provided, use the option instead of the top level variant
  if (optionId) {
    const foundOption = variant.options.find((option) => (
      option._id === optionId
    ));

    if (foundOption) {
      data = foundOption;
    }
  }

  // If a product object is provided with media,
  // then attempt to find some media for this variant
  if (product && Array.isArray(product.media)) {
    const foundMedia = product.media.find((media) => (
      media.variantId === data.variantId
    ));

    if (foundMedia) {
      imageURL = foundMedia.URLs.original;
    }
  }

  if (product) {
    if (product.shop) {
      const shopCurrency = product.shop.currency.code;
      const foundPricing = data.pricing.find((pricing) => pricing.currency.code === shopCurrency);

      if (foundPricing) {
        price = foundPricing.price; // eslint-disable-line prefer-destructuring
      }
    }

    const route = routes.findAndGetUrls("product", { slugOrId: product.slug || product._id, variantId: data._id });

    if (route && route.urls) {
      url = route.urls.as;
    }
  }

  return {
    variant: data._id,
    price,
    quantity: 1,
    position: data.index,
    value: price,
    image_url: imageURL, // eslint-disable-line camelcase
    url
  };
}
