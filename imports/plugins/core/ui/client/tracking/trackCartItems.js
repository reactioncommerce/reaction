import getCartItemTrackingData from "./utils/getCartItemTrackingData";

/**
 * @name trackCartItems
 * @summary Tracks cart-related Segment events
 * @param {Object} tracking Tracking prop provided by the withTracking HOC
 * @param {Object} data Data to track with event
 * @param {String} data.action Title of action to track
 * @param {Object|Array} data.cartItemOrItems Item added/removed or items in user's cart
 * @param {String} data.cartId _id of user's cart
 * @return {undefined} undefined
 */
export default function trackCartItems(tracking, { action, cartItemOrItems, cartId }) {
  const { trackEvent } = tracking;
  const data = {
    cart_id: cartId, // eslint-disable-line camelcase
    url: window.location.pathname
  };

  if (Array.isArray(cartItemOrItems)) {
    data.products = cartItemOrItems.map((item) => getCartItemTrackingData(item.node || item, cartId));
  } else {
    Object.assign(data, getCartItemTrackingData(cartItemOrItems, cartId));
  }

  trackEvent({
    action,
    data
  });
}
