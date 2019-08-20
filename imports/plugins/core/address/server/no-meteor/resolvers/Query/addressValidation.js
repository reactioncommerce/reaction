import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query/addressValidation
 * @method
 * @memberof Address/GraphQL
 * @summary Returns address validation results for an address
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} args.address - The AddressInput to validate
 * @param {Object} args.shopId - The shop to use for address validation settings
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Promise that resolves with an object with results
 */
export default async function addressValidation(_, { address, shopId: opaqueShopId }, context) {
  const shopId = decodeShopOpaqueId(opaqueShopId);
  return context.queries.addressValidation({ address, shopId }, context);
}
