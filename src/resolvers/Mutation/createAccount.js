import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name group/createAccount
 * @method
 * @memberof Group/GraphQL
 * @summary A resolver creates a new account for an existing user
 * @param {object} _ - Not used
 * @param {object} input - The input supplied from GraphQL
 * @param {String} input.shopId - id of the shop in which the account is to be created
 * @param {String} input.userId - id of the user for who the account is to be created
 * @param {object} context - The GraphQL context
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function createAccount(_, { input }, context) {
  const { shopId, clientMutationId } = input;
  const decodedShopId = decodeShopOpaqueId(shopId);

  const transformedInput = { ...input, shopId: decodedShopId };

  const account = context.mutations.createAccount(context, transformedInput);

  return {
    account,
    clientMutationId
  };
}
