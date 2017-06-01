import { Shops } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * getDomain
 * local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
export function getRegistryDomain(requestUrl) {
  const url = requestUrl || process.env.ROOT_URL;
  const domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
}


/**
 *  @private setDomain
 *  @summary update the default shop url if ROOT_URL supplied is different from current
 *  @return {String} returns insert result
 */
export function setDomain() {
  let currentDomain;
  // we automatically update the shop domain when ROOT_URL changes
  try {
    currentDomain = Shops.findOne().domains[0];
  } catch (_error) {
    Logger.error(_error, "Failed to determine default shop.");
  }
  // if the server domain changes, update shop
  const domain = getRegistryDomain();
  if (currentDomain && currentDomain !== domain) {
    Logger.debug("Updating domain to " + domain);
    Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": domain
      }
    });
  }
}
