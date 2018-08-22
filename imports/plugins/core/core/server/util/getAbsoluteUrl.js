import url from "url";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name getAbsoluteUrl
 * @summary Returns the absolute/base URL for where a request was made, using the request's headers
 * @param {Object} requestHeaders Headers sent with original request
 * @param {String} requestHeaders.host Domain (including port) request was made to
 * @param {String} requestHeaders.origin URL request originated from
 * @returns {String} protocol://hostname[:port]/, with protocol being from the origin URL
 */
export default function getAbsoluteUrl(requestHeaders) {
  const { host = "", origin = "" } = requestHeaders;

  if (host === "") {
    throw new ReactionError("invalid-parameters", "getAbsoluteUrl requires 'host' from request headers");
  }
  if (origin === "") {
    throw new ReactionError("invalid-parameters", "getAbsoluteUrl requires 'origin' from request headers");
  }

  const originParsedUrl = url.parse(origin);
  const { protocol } = originParsedUrl;

  return `${protocol}//${host}/`;
}
