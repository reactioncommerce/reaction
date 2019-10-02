import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeSurchargeOpaqueId } from "../../xforms/surcharge.js";

/**
 * @name Query/surchargeById
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the surchargeById GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.language - Language to retrieve surcharge message in
 * @param {String} args.surchargeId - Surcharge ID of the surcharge we are requesting
 * @param {String} args.shopId - The shop that owns this surcharge
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>|undefined} A Surcharge object
 */
export default async function surchargeById(parentResult, args, context) {
  const { surchargeId, shopId } = args;

  return context.queries.surchargeById(context, {
    surchargeId: decodeSurchargeOpaqueId(surchargeId),
    shopId: decodeShopOpaqueId(shopId)
  });
}
