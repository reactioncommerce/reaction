import * as snippet from "@segment/snippet";
import { Meteor } from "meteor/meteor";

/**
 * Dispatch tracking data to segment
 * @name dispatch
 * @ignore
 * @param {Object} data Arguments supplied by tracking library
 * @param {String} data.action String value used as the first param to analytics.track()
 * @returns {undefined} No Return
 */
export function dispatch(data) {
  // Workaround for not being able to use object rest spread
  const newData = Object.assign({}, data);
  const { action } = newData;
  delete newData.action;

  window && window.analytics && window.analytics.track(action, newData);
}

/**
 * Render string script
 * @returns {String} String script to be included in the document head
 */
export function renderScript() {
  const { segmentAnalyticsWriteKey } = Meteor.settings.public;
  if (!segmentAnalyticsWriteKey) {
    return "";
  }

  const opts = {
    apiKey: segmentAnalyticsWriteKey,
    page: true // Set this to `false` if you want to manually fire `analytics.page()` from within your pages.
  };

  return snippet.min(opts);
}
