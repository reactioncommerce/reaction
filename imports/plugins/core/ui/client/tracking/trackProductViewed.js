import getProductTrackingData from "./utils/getProductTrackingData";
import getVariantTrackingData from "./utils/getVariantTrackingData";

/**
 * @name trackProductViewed
 * @summary Tracks the "Product Viewed" Segment event
 * @param {Object} tracking Tracking prop provided by the withTracking HOC
 * @param {Object} data Object containing product & optional variant & optionId
 * @param {Object} data.product Product being viewed
 * @param {Object} [data.variant] Variant being viewed, if appliable
 * @param {String} [data.optionId] Option/child variant being viewed, if applicable
 * @returns {undefined}
 */
export default function trackProductViewed(tracking, { product, variant, optionId = "" }) {
  const { trackEvent } = tracking
  let data = {
    action: "Product Viewed",
    ...getProductTrackingData(product)
  };

  if (window.location.pathname) {
    data.url = window.location.pathname;
  }

  // Add variant data if available
  if (variant) {
    data = {
      ...data,
      ...getVariantTrackingData({
        variant, // Object representing a variant. (Required)
        optionId, // Selected option of the provided variant, if available. (Optional)
        product // Full product document for additional data. (Optional)
      })
    };
  }

  trackEvent(data);
}
