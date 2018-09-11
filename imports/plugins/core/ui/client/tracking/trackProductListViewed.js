import getProductListTrackingData from "./utils/getProductListTrackingData";

/**
 * @name trackProductViewed
 * @summary Tracks the "Product List Viewed" Segment event
 * @param {Object} tracking Tracking prop provided by the withTracking HOC
 * @param {Object} data Object containing products and optional tag
 * @param {Object} data.products Products currently in the grid
 * @param {Object} [data.tag] Tag being viewed, if appliable
 * @returns {undefined}
 */
export default function trackProductListViewed(tracking, { products, tag }) {
  const { trackEvent } = tracking;

  const data = getProductListTrackingData({ tag, products });

  trackEvent({
    action: "Product List Viewed",
    ...data
  });
}
