/**
 * @name getAbsoluteUrl
 * @summary Combines and returns the given root URL and path
 * @param {String} rootUrl URL ending with /
 * @param {String} path Path that may or may not start with /
 * @returns {String} Full URL
 */
export default function getAbsoluteUrl(rootUrl, path = "") {
  let pathNoSlash = path;
  if (path.startsWith("/")) {
    pathNoSlash = path.slice(1);
  }

  // If the path already contains the rootUrl
  // don't add it again
  if (rootUrl === path.slice(0, rootUrl.length)) {
    return pathNoSlash;
  }

  return `${rootUrl}${pathNoSlash}`;
}
