import { curry } from "ramda";
import decodeOpaqueId from "./decodeOpaqueId.js";

/**
 * @name decodeOpaqueIdForNamespace
 * @method
 * @summary Transforms an opaque ID to an internal ID, throwing an error if the namespace is wrong
 * @param {String} namespace The namespace that you expect the decoded ID to have
 * @param {String} opaqueId The ID to transform
 * @returns {String} An internal ID
 */
const decodeOpaqueIdForNamespace = curry((namespace, opaqueId, error = new Error(`ID namespace must be ${namespace}`)) => {
  const decodedId = decodeOpaqueId(opaqueId);
  if (!decodedId) return null;
  const { namespace: actualNamespace, id } = decodedId;
  if (actualNamespace !== namespace) throw error;
  return id;
});

export default decodeOpaqueIdForNamespace;
