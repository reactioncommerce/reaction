/**
 * @method getRegistryDomain
 * @memberof Core
 * @summary local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
export default function getRegistryDomain(requestUrl) {
  const url = requestUrl || process.env.ROOT_URL;
  const domain = url.match(/^https?:\/\/([^/:?#]+)(?:[/:?#]|$)/i)[1];
  return domain;
}
