import { curry } from "ramda";

/**
 * @name encodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an internal ID to an opaque ID
 * @param {String} namespace The namespace of the ID
 * @param {String} id The ID to transform
 * @returns {String} An opaque ID
 */
const encodeOpaqueId = curry((namespace, id) => {
  if (typeof id !== "string" && typeof id !== "number") return id;
  const unencoded = `${namespace}:${id}`;
  return Buffer.from(unencoded).toString("base64");
});

export default encodeOpaqueId;
