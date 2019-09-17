/**
 * @name Mutation/verifySMTPEmailSettings
 * @method
 * @summary resolver for the verifySMTPEmailSettings GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [input.host] - The host of the SMTP email service. Automatically provided if service !== `custom`.
 * @param {String} input.password - password of SMTP email service account.
 * @param {String} [input.port] - The port of the SMTP email service. Automatically provided if service !== `custom`.
 * @param {String} input.service - SMTP email service to use.
 * @param {String} input.shopId - ShopID this setting belongs to.
 * @param {String} input.user - username of SMTP email service account.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} verifySMTPEmailSettingsPayload
 */
export default async function verifySMTPEmailSettings(_, { input }, context) {
  const {
    clientMutationId = null,
    host,
    password,
    port,
    service,
    shopId,
    user
  } = input;

  const isVerified = await context.mutations.verifySMTPEmailSettings(context, {
    host,
    password,
    port,
    service,
    shopId,
    user
  });

  return {
    clientMutationId,
    isVerified
  };
}
