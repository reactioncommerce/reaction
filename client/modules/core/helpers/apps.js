import _ from "lodash";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import { Packages, Shops } from "/lib/collections";

/**
 * @typedef optionHash
 * @type {Object}
 * @property {String} name - name of a package.
 * @property {String} provides -purpose of this package as identified to the registry
 * @property {String} container - filter registry entries for matching container.
 * @property {String} shopId - filter to only display results matching shopId, not returned
 * @property {String} template - filter registry entries for matching template
 */

/**
 * @method Apps
 * @param {optionHash} optionHash Option hash
 * @returns {Object[]} returns an array of filtered, structure reactionApps
 */
export function Apps(optionHash) {
  const { getUserId } = Reaction;
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

  // Get the shop to determine shopType
  const shop = Shops.findOne({ _id: options.shopId }) || {};
  const { shopType } = shop;

  // remove audience permissions for owner (still needed here for older/legacy calls)
  if (Reaction.hasOwnerAccess() && options.audience) {
    delete options.audience;
  }

  //
  // build filter to only get matching registry elements
  //
  for (key in options) {
    if ({}.hasOwnProperty.call(options, key)) {
      const value = options[key];
      if (value) {
        if (!(key === "enabled" || key === "name" || key === "shopId")) {
          filter[`registry.${key}`] = Array.isArray(options[key]) ? { $in: value } : value;
          registryFilter[key] = value;
        } else {
          // perhaps not the best way to check but lets admin see all packages
          if (!Reaction.hasOwnerAccess()) {
            if (key !== "shopId") {
              registryFilter[key] = value;
            }
          }
          filter[key] = value;
        }
      }
    }
  }

  delete filter["registry.audience"]; // Temporarily remove "audience" key (see comment below)

  // TODO: Review fix for filter on Packages.find(filter)
  // The current "filter" setup uses "audience" field which is not present in the registry array in most (if not all) docs
  // in the Packages coll.
  // For now, the audience checks (after the Package.find call) filters out the registry items based on permissions. But
  // part of the filtering should have been handled by the Package.find call, if the "audience" filter works as it should.
  Packages.find(filter).forEach((app) => {
    const matchingRegistry = _.filter(app.registry, (item) => {
      const itemFilter = _.cloneDeep(registryFilter);

      // check audience permissions only if they exist as part of optionHash and are part of the registry item
      // ideally all routes should use it, safe for backwards compatibility though
      // owner bypasses permissions
      if (!Reaction.hasOwnerAccess() && item.permissions && registryFilter.audience) {
        let hasAccess;

        for (const permission of registryFilter.audience) {
          // This checks that the registry item contains a permissions matches with the user's permission for the shop
          const hasPermissionToRegistryItem = item.permissions.indexOf(permission) > -1;
          // This checks that the user's permission set have the right value that is on the registry item
          const hasRoleAccessForShop = Roles.userIsInRole(getUserId(), permission, Reaction.getShopId());

          // both checks must pass for access to be granted
          if (hasPermissionToRegistryItem && hasRoleAccessForShop) {
            hasAccess = true;
            break;
          }
        }

        if (!hasAccess) {
          return false;
        }

        // safe to clean up now, and isMatch can ignore audience
        delete itemFilter.audience;
      }

      // Check that shopType matches showForShopType if option is present
      if (item.showForShopTypes &&
          Array.isArray(item.showForShopTypes) &&
          !item.showForShopTypes.includes(shopType)) {
        return false;
      }

      // Check that shopType does not match hideForShopType if option is present
      if (item.hideForShopTypes &&
          Array.isArray(item.hideForShopTypes) &&
          item.hideForShopTypes.includes(shopType)) {
        return false;
      }

      // Loop through all keys in the itemFilter
      // each filter item should match exactly with the property in the registry or
      // should be included in the array if that property is an array
      return Object.keys(itemFilter).every((property) => {
        const filterVal = itemFilter[property];
        const itemVal = item[property];

        // Check to see if the registry entry is an array.
        // Legacy registry entries could exist that use a string even when the schema requires an array.
        // If it's not an array, the filter should match exactly
        return Array.isArray(itemVal) ? itemVal.includes(filterVal) : itemVal === filterVal;
      });
    });

    for (const registry of matchingRegistry) {
      reactionApps.push(registry);
    }
  });

  // Sort apps by priority (registry.priority)
  return reactionApps.sort((appA, appB) => appA.priority - appB.priority).slice();
}

/**
 *
 * @name reactionApps
 * @memberof BlazeTemplateHelpers
 * @summary Return an array of filtered, structured `reactionApps` as a Template Helper
 * @example {{#each reactionApps provides="settings" name=packageName container=container}}
 * @example {{#each reactionApps provides="userAccountDropdown" enabled=true}}
 * @param {optionHash} optionHash Option hash
 * @returns {Object[]} returns an array of filtered, structure reactionApps
 * ```[{
 *   enabled: true
 *   label: "Stripe"
 *   name: "reaction-stripe"
 *   packageId: "QqkGsQCDRhg2LSn8J"
 *   priority: 1
 *   provides: "paymentMethod"
 *   template: "stripePaymentForm"
 *   etc: "additional properties as defined in Packages.registry"
 *   ...
 *  }]```
 */
Template.registerHelper("reactionApps", (optionHash) => Reaction.Apps(optionHash));
