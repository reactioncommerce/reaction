import { Meteor } from "meteor/meteor";

const opaqueIdCache = {};

/**
 * @summary Get opaque IDs for GraphQL calls
 * @param {Object[]} methodInput Argument to pass to "getOpaqueIdFromInternalId" Meteor method
 * @returns {String[]} Array of opaque IDs in the same order as `methodInput` array
 */
export default function getOpaqueIds(methodInput) {
  return new Promise((resolve, reject) => {
    // Try to get all from in-memory cache if possible
    let allFoundInCache = true;
    const resultsFromCache = methodInput.map(({ namespace, id }) => {
      if (opaqueIdCache[namespace] && opaqueIdCache[namespace][id]) {
        return opaqueIdCache[namespace][id];
      }
      allFoundInCache = false;
      return null;
    });

    if (allFoundInCache) {
      resolve(resultsFromCache);
      return;
    }

    Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
      if (error) {
        reject(error);
      } else {
        // Cache results in memory
        methodInput.forEach(({ namespace, id }, index) => {
          if (!opaqueIdCache[namespace]) opaqueIdCache[namespace] = {};
          opaqueIdCache[namespace][id] = opaqueIds[index];
        });

        resolve(opaqueIds);
      }
    });
  });
}
