import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.generateSitemaps
 * @method
 * @memberof Sitemap/GraphQL
 * @summary resolver for the generateSitemaps GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.shopId shopId to generate sitemap for
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Boolean>} true on success
 */
export default async function generateSitemaps(parentResult, { input = {} }, context) {
  const { clientMutationId = null, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  await context.mutations.generateSitemaps(context, { shopId });

  return {
    wasJobScheduled: true,
    clientMutationId
  };
}
