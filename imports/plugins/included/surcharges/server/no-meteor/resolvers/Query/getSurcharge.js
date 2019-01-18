import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeSurchargeOpaqueId } from "../../xforms/surcharge";

/**
 * @name "Query.getSurcharge"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getSurcharge GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.language - Language to retrieve surcharge message in
 * @param {String} args.surchargeId - Surcharge ID of the surcharge we are requesting
 * @param {String} args.shopId - The shop that owns this surcharge
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Surcharge object
 */
export default async function getSurcharge(parentResult, args, context) {
  const { language, surchargeId, shopId } = args;

  return context.queries.getSurcharge(context, {
    language,
    surchargeId: decodeSurchargeOpaqueId(surchargeId),
    shopId: decodeShopOpaqueId(shopId)
  });
}
