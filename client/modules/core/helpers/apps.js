import _ from "lodash";
import {Reaction, Logger} from "/client/api";
import {Packages} from "/lib/collections";
import {Template} from "meteor/templating";

/**
 *
 * reactionApps
 *
 *   provides="<where matching registry provides is this >"
 *   enabled=true <false for disabled packages>
 *   context= true filter templates to current route
 *
 * returns matching package registry objects
 *  @todo:
 *   - reintroduce a dependency context
 *   - introduce position,zones #148
 *   - is it better to get all packages once and filter in code
 *     and possibly have some cache benefits down the road,
 *     or to retrieve what is requested and gain the advantage of priviledged,
 *     unnecessary data not retrieved with the cost of additional requests.
 *   - context filter should be considered experimental
 *
 *   @example {{#each reactionApps provides="settings" name=packageName container=container}}
 *   @example {{#each reactionApps provides="userAccountDropdown" enabled=true}}
 *   @example
 *     {{#each reactionApps provides="social" name="reaction-social"}}
 *         {{> Template.dynamic template=template data=customSocialSettings }}
 *     {{/each}}
 *
 *   @typedef optionHash
 *   @type {object}
 *   @property {string} name - name of a package.
 *   @property {string} provides -purpose of this package as identified to the registry
 *   @property {string} container - filter registry entries for matching container.
 *   @property {string} shopId - filter to only display results matching shopId, not returned
 *   @property {string} template - filter registry entries for matching template
 *   @type {optionHash}
 *
 *  @return {optionHash} returns an array of filtered, structure reactionApps
 *  [{
 *  	enabled: true
 *   label: "Stripe"
 *   name: "reaction-stripe"
 *   packageId: "QqkGsQCDRhg2LSn8J"
 *   priority: 1
 *   provides: "paymentMethod"
 *   template: "stripePaymentForm"
 *   etc: "additional properties as defined in Packages.registry"
 *   ...
 *  }]
 */

export function Apps(optionHash) {
  const filter = {};
  const registryFilter = {};
  let key;
  const reactionApps = [];
  let options = {};

  // allow for object or option.hash
  if (optionHash) {
    if (optionHash.hash) {
      options = optionHash.hash;
    } else {
      options = optionHash;
    }
  }

  // you could provide a shopId in optionHash
  if (!options.shopId) {
    options.shopId = Reaction.getShopId();
  }

  //
  // build filter to only get matching registry elements
  //
  for (key in options) {
    if ({}.hasOwnProperty.call(options, key)) {
      const value = options[key];
      if (value) {
        if (!(key === "enabled" || key === "name" || key === "shopId")) {
          filter["registry." + key] = value;
          registryFilter[key] = value;
        } else {
          filter[key] = value;
        }
      }
    }
  }

  // return these fields
  const fields = {
    enabled: 1,
    registry: 1,
    name: 1,
    provides: 1,
    icon: 1,
    settingsKey: 1
    // settings: 1 // restricted to enabled
  };

  // fetch the packages
  Packages.find(filter, fields).forEach((app) => {
    const matchingRegistry = _.find(app.registry, registryFilter);
    if (matchingRegistry) reactionApps.push(matchingRegistry);
  });

  // sort cycle to ensure order
  // const sortedReactionApps = reactionApps.sort((a, b) => a.priority - b.priority).slice();
  // enable debug to find missing reaction apps
  if (reactionApps.length === 0) {
    Logger.info("Failed to return matching reaction apps for", optionHash);
  }

  return reactionApps;
}

// Register global template helper
Template.registerHelper("reactionApps", (optionHash) => {
  return Reaction.Apps(optionHash);
});
