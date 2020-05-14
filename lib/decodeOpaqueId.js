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
  const buffer = Buffer.from(opaqueId, "base64");

  // As far as I can tell, round-tripping back to base64 is the
  // only robust way to determine whether it was encoded as base64
  // in the first place.
  if (buffer.toString("base64") !== opaqueId) {
    return { namespace: null, id: opaqueId };
  }

  const unencoded = buffer.toString("utf8");
  const [namespace, id] = unencoded.split(":");
  return { namespace, id };
}
