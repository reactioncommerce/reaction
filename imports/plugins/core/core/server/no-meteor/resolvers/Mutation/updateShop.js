import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/updateShop
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateShop GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.shopLogoUrls -  shop logo urls
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} ShopsPayload
 */
export default async function updateShop(_, { input }, context) {
  const {
    shopId: opaqueShopId,
    shopLogoUrls,
    clientMutationId = null
  } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const updatedShop = await context.mutations.updateShop(context, {
    shopId,
    shopLogoUrls
  });

  return {
    shop: updatedShop,
    clientMutationId
  };
}


