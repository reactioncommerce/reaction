import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentRestrictionOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/getFlatRateFulfillmentRestriction
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getFlatRateFulfillmentRestriction GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns this restriction
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>|undefined} A Restriction object
 * @deprecated since version 5.0, use flatRateFulfillmentRestriction instead
 */
export default async function getFlatRateFulfillmentRestriction(parentResult, args, context) {
  const { restrictionId, shopId } = args;

  return context.queries.getFlatRateFulfillmentRestriction(context, {
    restrictionId: isOpaqueId(restrictionId) ? decodeFulfillmentRestrictionOpaqueId(restrictionId) : restrictionId,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId
  });
}
