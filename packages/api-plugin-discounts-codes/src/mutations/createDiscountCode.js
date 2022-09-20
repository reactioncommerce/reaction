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
  const { shopId, ...discountCodeInput } = input;
  const { appEvents, collections } = context;
  const { Discounts } = collections;

  await context.validatePermissions("reaction:legacy:discounts", "create", { shopId });

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
