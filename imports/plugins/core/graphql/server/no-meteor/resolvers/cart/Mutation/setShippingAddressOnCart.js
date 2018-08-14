/**
 * @name "Mutation.setShippingAddressOnCart"
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the setShippingAddressOnCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} SetShippingAddressOnCartPayload
 */
export default async function setShippingAddressOnCart(parentResult, { input }, context) {
  const { clientMutationId = null } = input;
  // TODO: decode incoming IDs here
  const renameMe = await context.mutations.cart.setShippingAddressOnCart(context);
  return {
    renameMe,
    clientMutationId
  };
}
