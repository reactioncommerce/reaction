/**
 * @name Mutation/verifySMTPEmailSettings
 * @method
 * @summary resolver for the verifySMTPEmailSettings GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} input.shopId - ShopID this setting belongs to.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} verifySMTPEmailSettingsPayload
 */
export default async function verifySMTPEmailSettings(_, { input }, context) {
  const {
    clientMutationId = null,
    shopId
  } = input;

  const isVerified = await context.mutations.verifySMTPEmailSettings(context, {
    shopId
  });

  return {
    clientMutationId,
    isVerified
  };
}
