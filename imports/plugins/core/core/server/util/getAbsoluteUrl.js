/**
 * @name getAbsoluteUrl
 * @summary Combines and returns the given root URL and path
 * @param {String} rootUrl URL ending with /
 * @param {String} path Path that may or may not start with /
 * @returns {String}
 */
export default function getAbsoluteUrl(rootUrl, path = "") {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  return `${rootUrl}${path}`;
}
