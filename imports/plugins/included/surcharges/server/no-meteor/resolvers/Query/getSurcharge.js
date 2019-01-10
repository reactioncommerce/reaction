import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeSurchargeOpaqueId } from "../../xforms/surcharge";

/**
 * @name "Query.getSurcharge"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getSurcharge GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns this surcharge
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Surcharge object
 */
export default async function getSurcharge(parentResult, args, context) {
  const { surchargeId, shopId } = args;

  return context.queries.getSurcharge(context, {
    surchargeId: decodeSurchargeOpaqueId(surchargeId),
    shopId: decodeShopOpaqueId(shopId)
  });
}
