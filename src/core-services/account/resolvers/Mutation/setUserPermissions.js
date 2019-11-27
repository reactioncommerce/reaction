import Logger from "@reactioncommerce/logger";
/* import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";

const addUserToRolesLegacy = async (input, context) => {
  await context.validatePermissionsLegacy("reaction-accounts", context.userId, input.group);
  check(context.userId, Match.OneOf(String, Array));
  check(input.permissions, Match.OneOf(String, Array));
  check(input.group, Match.Optional(String));
  this.unblock();
  try {
    return Roles.addUsersToRoles(context.userId, input.permissions, input.group);
  } catch (error) {
    return Logger.error(error);
  }
};
*/
/**
 * @name Mutation/addUserPermissions
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver to add user permissions
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.group - The group the user is to be added to
 * @param {Object} context - an object containing the per-request state
 * @param {Object} args.context.userId - the userId of user to add to the given group
 * @returns {Object} - object
 */
export default async function addUserPermissions(_, { input }, context) {
  // await addUserToRolesLegacy(input, context);
  await context.validatePermissions("reaction:accounts", "create", { });
  return [];
}
