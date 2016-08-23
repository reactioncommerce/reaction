import { Reaction, Logger } from "/client/api";
import { Packages } from "/lib/collections";
import { Template } from "meteor/templating";

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
  let packages;
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
      if (!(key === "enabled" || key === "name" || key === "shopId")) {
        filter["registry." + key] = value;
        registryFilter[key] = value;
      } else {
        filter[key] = value;
      }
    }
  }

  // return these fields
  const fields = {
    enabled: 1,
    registry: 1,
    name: 1,
    provides: 1
  };

  // fetch the packages
  const reactionPackages = Packages.find(filter, fields).fetch();

  // apply filters to registry items
  if (reactionPackages.length) {
    // filter by package and enabled true/false
    if (filter.name && filter.enabled) {
      packages = (function () {
        const results = [];
        for (const pkg of reactionPackages) {
          if (pkg.name === filter.name && pkg.enabled === filter.enabled) {
            results.push(pkg);
          }
        }
        return results;
      })();
      // we want all entries by package name
    } else if (filter.name) {
      packages = (function () {
        const results = [];
        for (const pkg of reactionPackages) {
          if (pkg.name === filter.name) {
            results.push(pkg);
          }
        }
        return results;
      })();
      // just all enabled packages
    } else if (filter.enabled) {
      packages = (function () {
        const results = [];
        for (const pkg of reactionPackages) {
          if (pkg.enabled === filter.enabled) {
            results.push(pkg);
          }
        }
        return results;
      })();
      // no filter
    } else {
      packages = (function () {
        const results = [];
        for (const pkg of reactionPackages) {
          results.push(pkg);
        }
        return results;
      })();
    }

    // we have all the package app registry entries
    for (const app of packages) {
      // go through the registry entries and push enabled entries
      if (app.registry) {
        for (let registry of app.registry) {
          match = 0;
          for (key in registryFilter) {
            // make sure we're dealing with valid keys
            if ({}.hasOwnProperty.call(registryFilter, key)) {
              const value = registryFilter[key];
              if (registry[key] === value) {
                match += 1;
              }
              if (match === Object.keys(registryFilter).length) {
                if (!registry.packageName) registry.packageName = app.name;
                if (registry.enabled !== false) {
                  registry = Reaction.translateRegistry(registry, app);
                  registry.enabled = registry.enabled || app.enabled;
                  registry.packageId = app._id;
                  // check permissions before pushing so that templates aren't required.
                  if (Reaction.hasPermission([registry.name, registry.route])) {
                    reactionApps.push(registry);
                  }
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
  return reactionApps;
}

// Register global template helper
Template.registerHelper("reactionApps", (optionHash) => {
  return Reaction.Apps(optionHash);
});
