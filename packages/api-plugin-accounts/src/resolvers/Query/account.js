import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/account
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return user account data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} user account object
 */
export default function account(_, { id }, context) {
  const dbAccountId = isOpaqueId(id) ? decodeAccountOpaqueId(id) : id;
  return context.queries.userAccount(context, dbAccountId);
}
