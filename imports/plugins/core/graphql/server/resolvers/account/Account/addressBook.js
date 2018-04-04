import { map, pipe } from "ramda";
import { xformAddressResponse } from "@reactioncommerce/reaction-graphql-xforms/address";
import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";

/**
 * @name shop
 * @method
 * @summary converts the `addressBook` prop on the provided account to a connection
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @return {Object} The shop having ID account.shopId, in GraphQL schema format
 */
export default function addressBook(account, connectionArgs) {
  const { addressBook: addressList } = account;
  if (!Array.isArray(addressList)) return null;

  return pipe(
    map(xformAddressResponse),
    xformArrayToConnection(connectionArgs)
  )(addressList);
}
