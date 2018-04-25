import { assoc, curry } from "ramda";

/**
 * @name encodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an internal ID to an opaque ID
 * @param {String} namespace The namespace of the ID
 * @param {String} id The ID to transform
 * @returns {String} An opaque ID
 */
export const encodeOpaqueId = curry((namespace, id) => {
  if (typeof id !== "string" && typeof id !== "number") return id;
  const unencoded = `${namespace}:${id}`;
  return Buffer.from(unencoded).toString("base64");
});

/**
 * @name decodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an opaque ID to an internal ID
 * @param {String} opaqueId The ID to transform
 * @returns {String} An internal ID
 */
export const decodeOpaqueId = (opaqueId) => {
  if (opaqueId === undefined || opaqueId === null) return null;
  const unencoded = Buffer.from(opaqueId, "base64").toString("utf8");
  const [namespace, id] = unencoded.split(":");
  return { namespace, id };
};

/**
 * @name decodeOpaqueIdForNamespace
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an opaque ID to an internal ID, throwing an error if the namespace is wrong
 * @param {String} namespace The namespace that you expect the decoded ID to have
 * @param {String} opaqueId The ID to transform
 * @returns {String} An internal ID
 */
export const decodeOpaqueIdForNamespace = curry((namespace, opaqueId, error = new Error(`ID namespace must be ${namespace}`)) => {
  const decodedId = decodeOpaqueId(opaqueId);
  if (!decodedId) return null;
  const { namespace: actualNamespace, id } = decodedId;
  if (actualNamespace !== namespace) throw error;
  return id;
});

/**
 * @name assocOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Assoc an opaque ID onto an object by transforming its existing _id
 *   Assumes key is _id but key could be provided as another curried param.
 * @param {String} namespace The namespace
 * @param {Object} item An object with _id property
 */
export const assocOpaqueId = curry((namespace, item) =>
  assoc("_id", encodeOpaqueId(namespace, item._id), item));

/**
 * @name assocInternalId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Assoc an internal ID onto an object by decoding its existing opaque _id
 *   Assumes key is _id but key could be provided as another curried param.
 * @param {String} namespace The namespace
 * @param {Object} item An object with _id property
 */
export const assocInternalId = curry((namespace, item) =>
  assoc("_id", decodeOpaqueIdForNamespace(namespace, item._id), item));
