import Logger from "@reactioncommerce/logger";
import { Shops } from "/lib/collections";

/**
 * @method setDomain
 * @memberof Core
 * @summary update the default shop url if ROOT_URL supplied is different from current
 * @returns {String} returns insert result
 */
export default function setDomain() {
  let currentDomain;
  // we automatically update the shop domain when ROOT_URL changes
  try {
    [currentDomain] = Shops.findOne().domains;
  } catch (_error) {
    Logger.error(_error, "Failed to determine default shop.");
  }
  // if the server domain changes, update shop
  const domain = process.env.ROOT_URL.match(/^https?:\/\/([^/:?#]+)(?:[/:?#]|$)/i)[1];
  if (currentDomain && currentDomain !== domain) {
    Logger.debug(`Updating domain to ${domain}`);
    Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": domain
      }
    });
  }
}
