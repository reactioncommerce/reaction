import { createRequire } from "module";
import config from "./config.js";

const require = createRequire(import.meta.url); // eslint-disable-line

const { curry } = require("ramda");

/**
 * @name encodeOpaqueId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms an internal ID to an opaque ID. Passes through the `id`
 *   unchanged if the `REACTION_SHOULD_ENCODE_IDS` environment variable
 *   is `false`
 * @param {String} namespace The namespace of the ID
 * @param {String} id The ID to transform
 * @returns {String} An opaque ID
 */
const encodeOpaqueId = curry((namespace, id) => {
  if (config.REACTION_SHOULD_ENCODE_IDS === false) return id;
  if (typeof id !== "string" && typeof id !== "number") return id;
  const unencoded = `${namespace}:${id}`;
  return Buffer.from(unencoded).toString("base64");
});

export default encodeOpaqueId;
