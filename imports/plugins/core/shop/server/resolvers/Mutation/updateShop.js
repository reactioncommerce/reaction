import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/updateShop
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateShop GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} arts.input.shopLogoUrls - An object containing the shop logo urls to update
 * @param {Object} args.input.storefrontUrls - An object containing storefront url locations
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} ShopsPayload
 */
export default async function updateShop(_, { input }, context) {
  const {
    shopId: opaqueShopId,
    shopLogoUrls,
    storefrontUrls,
    clientMutationId = null
  } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const updatedShop = await context.mutations.updateShop(context, {
    shopId,
    shopLogoUrls,
    storefrontUrls
  });

  return {
    shop: updatedShop,
    clientMutationId
  };
}


