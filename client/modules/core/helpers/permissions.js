import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";

/*
 * Methods for the reaction permissions
 * helpers for roles, uses alanning:meteor-roles
 * see: http://alanning.github.io/meteor-roles/classes/Roles.html
 * use: {{hasPermission admin userId}}
 */

/**
 * hasPermission template helper
 * @summary check current user hasPermission
 * @param  {String|Array} "permissions"
 * @param  {String} checkUserId - optional Meteor.userId, default to current
 * @return {Boolean}
 */
Template.registerHelper("hasPermission", (permissions, options) => {
  // default to checking this.userId
  const loggedInUser = Meteor.userId();
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
 * hasOwnerAccess template helper
 * @summary check if user has owner access
 * @return {Boolean} return true if owner
 */
Template.registerHelper("hasOwnerAccess", () => Reaction.hasOwnerAccess());

/**
 * hasAdminAccess template helper
 * @summary check if user has admin access
 * @return {Boolean} return true if admin
 */
Template.registerHelper("hasAdminAccess", () => Reaction.hasAdminAccess());

/**
 * hasDashboardAccess template helper
 * @summary check if user has dashboard access
 * @return {Boolean} return true if user has dashboard permission
 */
Template.registerHelper("hasDashboardAccess", () => Reaction.hasDashboardAccess());

/**
 * allowGuestCheckout template helper
 * @summary check if guest users are allowed to checkout
 * @return {Boolean} return true if shop has guest checkout enabled
 */
Template.registerHelper("allowGuestCheckout", () => Reaction.allowGuestCheckout());
