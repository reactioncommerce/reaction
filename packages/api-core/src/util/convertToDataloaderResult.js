import _ from "lodash";

/**
 * @param {Array} requestedIds ids requested
 * @param {Array} returnedItems items to be returned
 * @param {String} key key of field
 * @returns {Array} requestedIds
 */
export default function convertToDataloaderResult(requestedIds, returnedItems, key = "id") {
  const byId = _.keyBy(returnedItems, key);
  return requestedIds.map((id) => (byId[id] === undefined ? null : byId[id]));
}
