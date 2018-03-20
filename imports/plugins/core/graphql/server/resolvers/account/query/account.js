import { pipe } from "ramda";
import { decodeAccountOpaqueId, xformAccountResponse } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name account
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - id of user to query
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function account(_, { id }, context) {
  // Transform ID from base64
  const dbAccountId = decodeAccountOpaqueId(id);

  return pipe(
    context.queries.userAccount,
    xformAccountResponse
  )(context, dbAccountId);
}
