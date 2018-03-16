import { xformAccountResponse } from "../../xforms/account";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";

/**
 * @name viewer
 * @method
 * @summary query the Accounts collection and return user account data for the current user
 * @param {Object} _ - an object containing the result returned from the resolver
 * @param {Object} args - an object of arguments to pass to the function
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function viewer(_, __, context) {
  const userId = (context && context.user && context.user._id) || {};

  // Get the current user account data
  const userAccount = userAccountQuery(context, userId);

  return xformAccountResponse(userAccount);
}
