/**
 * getDomain
 * local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
ReactionRegistry.getRegistryDomain = (requestUrl) => {
  let url = requestUrl || process.env.ROOT_URL;
  let domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
};


/**
 *  @private ReactionRegistry.setDomain
 *  @summary update the default shop url if ROOT_URL supplied is different from current
 *  @return {String} returns insert result
 */
ReactionRegistry.setDomain = function () {
  let currentDomain;
  // we automatically update the shop domain when ROOT_URL changes
  try {
    currentDomain = ReactionCore.Collections.Shops.findOne().domains[0];
  } catch (_error) {
    ReactionCore.Log.error("Failed to determine default shop.", _error);
  }
  // if the server domain changes, update shop
  let domain = ReactionRegistry.getRegistryDomain();
  if (currentDomain && currentDomain !== domain) {
    ReactionCore.Log.info("Updating domain to " + domain);
    ReactionCore.Collections.Shops.update({
      domains: currentDomain
    }, {
      $set: {
        "domains.$": domain
      }
    });
  }
};
