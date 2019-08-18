import { Template } from "meteor/templating";
import { Reaction } from "/client/api";

/**
 * @method hasPermission
 * @memberof BlazeTemplateHelpers
 * @summary check current user hasPermission, uses [alanning:meteor-roles](http://alanning.github.io/meteor-roles/classes/Roles.html)
 * @example {{hasPermission admin userId}}
 * @param  {String|Array} "permissions"
 * @param  {String} options - object
 * @returns {Boolean}
 */
Template.registerHelper("hasPermission", (permissions, options) => {
  const loggedInUser = Reaction.getUserId();
  const shopId = Reaction.getShopId();
  // we don't necessarily need to check here
  // as these same checks and defaults are
  // also performed in Reaction.hasPermission
  if (typeof options === "object") {
    if (options.hash.userId) {
      const { userId } = options.hash;
      return Reaction.hasPermission(permissions, userId || loggedInUser, shopId);
    }
  }
  return Reaction.hasPermission(permissions, loggedInUser, shopId);
});

/**
 * @method hasOwnerAccess
 * @memberof BlazeTemplateHelpers
 * @summary check if user has owner access, uses [alanning:meteor-roles](http://alanning.github.io/meteor-roles/classes/Roles.html)
 * @returns {Boolean} return true if owner
 */
Template.registerHelper("hasOwnerAccess", () => Reaction.hasOwnerAccess());

/**
 * @method hasAdminAccess
 * @memberof BlazeTemplateHelpers
 * @summary check if user has admin access, uses [alanning:meteor-roles](http://alanning.github.io/meteor-roles/classes/Roles.html)
 * @returns {Boolean} return true if admin
 */
Template.registerHelper("hasAdminAccess", () => Reaction.hasAdminAccess());

/**
 * @method hasDashboardAccess
 * @memberof BlazeTemplateHelpers
 * @summary check if user has dashboard access, uses [alanning:meteor-roles](http://alanning.github.io/meteor-roles/classes/Roles.html)
 * @returns {Boolean} return true if user has dashboard permission
 */
Template.registerHelper("hasDashboardAccess", () => Reaction.hasDashboardAccess());

/**
 * @method allowGuestCheckout
 * @memberof BlazeTemplateHelpers
 * @summary check if guest users are allowed to checkout, uses [alanning:meteor-roles](http://alanning.github.io/meteor-roles/classes/Roles.html)
 * @returns {Boolean} return true if shop has guest checkout enabled
 */
Template.registerHelper("allowGuestCheckout", () => Reaction.allowGuestCheckout());
