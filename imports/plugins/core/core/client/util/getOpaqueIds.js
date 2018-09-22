import { Meteor } from "meteor/meteor";

/**
 * @summary Get opaque IDs for GraphQL calls
 * @param {Object[]} methodInput Argument to pass to "getOpaqueIdFromInternalId" Meteor method
 * @returns {String[]} Array of opaque IDs in the same order as `methodInput` array
 */
export default function getOpaqueIds(methodInput) {
  return new Promise((resolve, reject) => {
    Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
      if (error) {
        reject(error);
      } else {
        resolve(opaqueIds);
      }
    });
  });
}
