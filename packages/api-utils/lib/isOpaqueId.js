/**
 * @name isOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Checks if the given ID is an opaque ID
 * @param {String} inputId The ID to check
 * @returns {Boolean} True if the ID is an opaque ID
 */
export default function isOpaqueId(inputId) {
  if (inputId === undefined || inputId === null) return null;

  const [namespace, id] = Buffer
    .from(inputId, "base64")
    .toString("utf8")
    .split(":", 2);

  if (namespace && namespace.startsWith("reaction/") && id) {
    return true;
  }

  return false;
}
