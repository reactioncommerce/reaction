import { assoc, curry } from "ramda";

/* Transform an internal ID to an opaque ID. */
export const encodeOpaqueId = curry((namespace, id) => {
  const unencoded = `${namespace}:${id}`;
  return Buffer.from(unencoded).toString("base64");
});

/* Transform an opaque ID to an internal ID. */
export const decodeOpaqueId = (opaqueId) => {
  const unencoded = Buffer.from(opaqueId, "base64").toString("utf8");
  const [namespace, id] = unencoded.split(":");
  return { namespace, id };
};

/* Assoc an opaque ID onto an object by transforming it's existing _id.
 * NOTE: Assumes key is _id but key could be provided as another curried param.
 */
export const assocOpaqueId = curry((namespace, item) =>
  assoc("_id", encodeOpaqueId(namespace, item._id), item));

/* Assoc an internal ID onto an object by decoding it's existing opaque _id.
 * NOTE: Assumes key is _id but key could be provided as another curried param.
 */
export const assocInternalId = (item) =>
  assoc("_id", decodeOpaqueId(item._id).id, item);
