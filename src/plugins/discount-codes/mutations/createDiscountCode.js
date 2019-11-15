import Random from "@reactioncommerce/random";
import { DiscountCodes as DiscountCodesSchema } from "../simpleSchemas.js";

/**
 * @name Mutation.createDiscountCode
 * @method
 * @memberof GraphQL/discount-doces
 * @summary Add a discount code
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} AddDiscountCodePayload
 */
export default async function createDiscountCode(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const { shopId, ...discountCodeInput } = input;
  const { appEvents, checkPermissions, collections } = context;
  const { Discounts } = collections;

  await checkPermissions(["admin", "owner"], shopId);

  const discountCode = {
    _id: Random.id(),
    shopId,
    ...discountCodeInput
  };

  DiscountCodesSchema.validate(discountCode);

  await Discounts.insertOne(discountCode);

  await appEvents.emit("afterDiscountCodeCreate", discountCode);

  return discountCode;
}
