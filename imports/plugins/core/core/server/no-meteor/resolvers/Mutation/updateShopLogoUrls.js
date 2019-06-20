import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/updateShopLogoUrls
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateShopLogoUrls GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.primaryShopLogoUrl - Primariy shop logo URL
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} ShopsPayload
 */
export default async function updateShopLogoUrls(_, { input }, context) {
  const {
    shopId: opaqueShopId,
    shopLogoUrls,
    clientMutationId = null
  } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const updatedShop = await context.mutations.updateShopLogoUrls(context, {
    shopId,
    shopLogoUrls
  });

  return {
    shop: updatedShop,
    clientMutationId
  };
}


