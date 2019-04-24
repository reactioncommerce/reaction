import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/updateShopUrls
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateShopUrls GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.storefrontHomeUrl - Storefront Home URL
 * @param {String} args.input.storefrontOrderUrl - Storefront single order URL
 * @param {String} args.input.storefrontOrdersUrl - Storefront orders URL
 * @param {String} args.input.storefrontAccountProfileUrl - Storefront Account Profile URL
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} ShopsPayload
 */
export default async function updateShopUrls(_, { input }, context) {
  const { shopId: opaqueShopId, storefrontHomeUrl, storefrontOrderUrl, storefrontOrdersUrl, storefrontAccountProfileUrl, clientMutationId = null } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const updatedShop = await context.mutations.updateShopUrls(context, {
    shopId,
    storefrontUrls: {
      storefrontHomeUrl,
      storefrontOrderUrl,
      storefrontOrdersUrl,
      storefrontAccountProfileUrl
    }
  });

  return {
    shop: updatedShop,
    clientMutationId
  };
}


