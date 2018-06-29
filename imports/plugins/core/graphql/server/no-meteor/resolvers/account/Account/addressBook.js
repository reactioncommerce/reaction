import { get } from "lodash";
import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";

/**
 * @name "Account.addressBook"
 * @method
 * @memberof Accounts/GraphQL
 * @summary converts the `addressBook` prop on the provided account to a connection
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @return {Promise<Object>} A connection object
 */
export default async function addressBook(account, connectionArgs) {
  const addressList = get(account, "profile.addressBook");
  if (!Array.isArray(addressList)) return null;

  return xformArrayToConnection(connectionArgs, addressList);
}
