import url from "url";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name getAbsoluteUrl
 * @summary Returns the absolute/base URL for where a request was made, using the request's headers
 * @param {Object} requestHeaders Headers sent with original request
 * @param {String} requestHeaders.host Domain (including port) request was made to
 * @returns {String} protocol://hostname[:port]/
 */
export default function getAbsoluteUrl(requestHeaders, protocol) {
  let { host = "" } = requestHeaders;

  if (host === "") {
    return "";
  }

  host = host.replace("reaction-api", "localhost");

  return `${protocol}://${host}/`;
}
