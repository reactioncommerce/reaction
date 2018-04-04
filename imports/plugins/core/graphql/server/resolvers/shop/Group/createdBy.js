import { pipe } from "ramda";
import { xformAccountResponse } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name createdBy
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} args - an object of all arguments that were sent by the previous resolver
 * @param {Object} args.createdBy - a string account id
 * @param {Object} _ - unused
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function createdBy({ createdBy: createdByAccountId }, _, context) {
  return pipe(
    context.queries.userAccount,
    xformAccountResponse
  )(context, createdByAccountId);
}
