/**
 * @name getRootUrl
 * @summary Returns the root URL, returning process.env.ROOT_URL if set,
 *  otherwise using the request's protocol & hostname
 * @param {Object} request Express request object
 * @param {Object} request.hostname Hostname derived from Host or X-Forwarded-Host heaer
 * @param {String} request.protocol Either http or https
 * @returns {String} URL
 */
export default function getRootURL(request) {
  const { ROOT_URL } = process.env;
  if (ROOT_URL) {
    if (ROOT_URL.endsWith("/")) {
      return ROOT_URL;
    }
    return `${ROOT_URL}/`;
  }

  const { hostname, protocol } = request;
  return `${protocol}://${hostname}/`;
}
