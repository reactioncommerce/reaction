/**
 * @name decodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an opaque ID to an internal ID
 * @param {String} opaqueId The ID to transform
 * @returns {String} An internal ID
 */
export default function decodeOpaqueId(opaqueId) {
  if (opaqueId === undefined || opaqueId === null) return null;

  const [namespace, id] = Buffer
    .from(opaqueId, "base64")
    .toString("utf8")
    .split(":");

  if (namespace && id) {
    return { namespace, id };
  }

  return { namespace: null, id: opaqueId };
}
