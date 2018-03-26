import { xformAccountResponse } from "../../xforms/account";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { decodeOpaqueId } from "../../xforms/id";

/**
 * @name account
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} _ - an object containing the result returned from the resolver
 * @param {Object} args - an object of arguments to pass to the function
 * @param {String} args.id - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function account(_, { id }, context) {
  // Trasform ID from base64
  // Returns an object. Use `.id` to get ID
  const idFromBase64 = decodeOpaqueId(id);

  // Pass decoded id (idFromBase64.id) and context into userAccountQuery function
  const userAccount = userAccountQuery(context, idFromBase64.id);

  return xformAccountResponse(userAccount);
}
