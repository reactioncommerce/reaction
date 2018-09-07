import getProductTrackingData from "./getProductTrackingData";

/**
 * Transform a list of products into data for tracking with the Segment Product List Viewed event
 * @name getProductListTrackingData
 * @param {Object} data Object containing data for tracking a list of products
 * @param {Object} [data.tag] Tag object, used to associate the list with a uniq identifier
 * @param {Array} data.products An array of product documents
 * @returns {Object} Data for tracking
 */
export default function getProductListTrackingData({ tag, products }) {
  const data = {};

  if (tag) {
    data.list_id = tag._id; // eslint-disable-line camelcase
    data.category = tag.name;
  }

  if (Array.isArray(products) && products.length) {
    data.products = products.map((product) => getProductTrackingData(product));
  }

  return data;
}
