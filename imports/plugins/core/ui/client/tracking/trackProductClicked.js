import getProductTrackingData from "./utils/getProductTrackingData";

/**
 * @name trackProductClicked
 * @summary Tracks the "Product Clicked" Segment event
 * @param {Object} tracking Tracking prop provided by the withTracking HOC
 * @param {Object} product The product that was viewed
 * @returns {undefined}
 */
export default function trackProductClicked(tracking, product) {
  const { trackEvent } = tracking;
  trackEvent({
    action: "Product Clicked",
    ...getProductTrackingData(product)
  });
}
