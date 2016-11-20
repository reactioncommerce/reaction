import { EJSON } from "meteor/ejson";
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
  let match;
  let reactionApps = [];
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
        // console.log(key);
        if (!(key === "enabled" || key === "name" || key === "shopId")) {
          // filter[key] = value;
          filter["registry." + key] = value;
          registryFilter[key] = value;
          // console.log("is not enabled", key)
        } else {
          filter[key] = value;
        }
      }
    }
  }
  // console.log("filter", filter, EJSON.stringify(filter));
  // console.log("registryFilter", registryFilter);

  // return these fields
  const fields = {
    enabled: 1,
    registry: 1,
    name: 1,
    provides: 1,
    icon: 1,
    settingsKey: 1
  };

  // fetch the packages
  const reactionPackages = Packages.find(filter, fields).fetch();
  console.table(reactionPackages)

  // apply filters to registry items
  if (reactionPackages.length) {
    // we have all the package app registry entries
    for (const app of reactionPackages) {
      // go through the registry entries and push enabled entries
      if (app.registry) {
        for (const registry of app.registry) {
          match = 0;
          for (key in registryFilter) {
            // make sure we're dealing with valid keys
            if ({}.hasOwnProperty.call(registryFilter, key)) {
              const value = registryFilter[key];
              if (registry[key] === value) {
                match += 1;
              }
              if (match === Object.keys(registryFilter).length) {
                // console.log(registry.packageName, registry.enabled);
                // check permissions before pushing so that templates aren't required.
                // we are pushing registry.enabled which should be checked in ui
                console.log(registry)
                if (Reaction.hasPermission([registry.packageName]) || registry.enabled === true) {
                  reactionApps.push(registry);
                }
              }
            }
          }
        }
      }
    }
    // we only need any given package once, let's be sure.
    reactionApps = _.uniq(reactionApps);

    // sort cycle to ensure order
    reactionApps = reactionApps.sort((a, b) => a.priority - b.priority).slice();
  } // end reactionPackages check

  // enable debug to find missing reaction apps
  if (reactionApps.length === 0) {
    Logger.info("Failed to return matching reaction apps for", optionHash);
  }
  // we're done.
  // console.table(reactionApps);
  return reactionApps;
}

// Register global template helper
Template.registerHelper("reactionApps", (optionHash) => {
  return Reaction.Apps(optionHash);
});
