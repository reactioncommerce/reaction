import getProductListTrackingData from "./utils/getProductListTrackingData";

export default function trackProductListViewed(tracking, { tag, products }) {
  const { trackEvent } = tracking;

  const data = getProductListTrackingData({ tag, products });

  trackEvent({
    action: "Product List Viewed",
    ...data
  });
}
