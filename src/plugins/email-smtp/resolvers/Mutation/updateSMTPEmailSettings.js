import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";

/**
 * @name Mutation/updateSMTPEmailSettings
 * @method
 * @summary resolver for the updateSMTPEmailSettings GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [input.settings.host] - The host of the SMTP email service.
 * @param {String} input.settings.password - password of SMTP email service account.
 * @param {String} [input.settings.port] - The port of the SMTP email service.
 * @param {String} input.settings.service - SMTP email service to use.
 * @param {String} input.settings.shopId - ShopID this setting belongs to.
 * @param {String} input.settings.user - username of SMTP email service account.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} verifySMTPEmailSettingsPayload
 */
export default async function updateSMTPEmailSettings(_, { input }, context) {
  const {
    clientMutationId = null,
    settings
  } = input;
  const { shopId: opaqueShopId, ...passThroughInput } = settings;
  const shopId = decodeOpaqueIdForNamespace("reaction/shop", opaqueShopId);

  const updatedSettings = await context.mutations.updateSMTPEmailSettings(context, {
    shopId,
    ...passThroughInput
  });

  return {
    clientMutationId,
    settings: updatedSettings
  };
}
