import analyticsProviders from "../analyticsProviders";

/**
 * Dispatch tracking data to providers
 * @name dispatch
 * @param {Object} data Arguments supplied by tracking library
 * @returns {undefined} No Return
 */
export default function dispatch(data) {
  // Dispatch analytics events
  analyticsProviders.forEach((provider) => {
    provider.dispatch(data);
  });
}
