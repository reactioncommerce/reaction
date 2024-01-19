import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeAddressOpaqueId, decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/setShippingAddressOnCart
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the setShippingAddressOnCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.address - The shipping address
 * @param {String} [args.input.addressId] - If set, this will be saved as the Address._id. Otherwise an ID will be generated.
 * @param {String} args.input.cartId - The cart to set shipping address on
 * @param {String} [args.input.cartToken] - The token for the cart, required if it is an anonymous cart
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} SetShippingAddressOnCartPayload
 */
export default async function setShippingAddressOnCart(parentResult, { input }, context) {
  const { address, addressId: opaqueAddressId, cartId: opaqueCartId, cartToken, clientMutationId = null } = input;

  const addressId = isOpaqueId(opaqueAddressId) ? decodeAddressOpaqueId(opaqueAddressId) : opaqueAddressId;
  const cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;

  const { cart } = await context.mutations.setShippingAddressOnCart(context, {
    address,
    addressId,
    cartId,
    cartToken
  });

  return {
    cart,
    clientMutationId
  };
}
