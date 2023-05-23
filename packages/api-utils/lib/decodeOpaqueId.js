/**
 * @name decodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @deprecated In newer versions of reaction (v5 onwards) the encoding of IDs is not required. The encoding and decoding
 * of IDs will be removed in v6. If a developer implements a custom plugin they shouldn't encode and decode the IDs of
 * entities.
 * @summary Transforms an opaque ID to an internal ID
 * @param {String} opaqueId The ID to transform
 * @returns {String} An internal ID
 */
export default function decodeOpaqueId(opaqueId) {
  if (opaqueId === undefined || opaqueId === null) return null;

  const [namespace, id] = Buffer
    .from(opaqueId, "base64")
    .toString("utf8")
    .split(":", 2);

  if (namespace && namespace.startsWith("reaction/") && id) {
    return { namespace, id };
  }

  return { namespace: null, id: opaqueId };
}
