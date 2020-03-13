import { DiscountCodes as DiscountCodesSchema } from "../simpleSchemas.js";

/**
 * @name Mutation.updateDiscountCode
 * @method
 * @memberof GraphQL/discount-codes
 * @summary Update a discount code
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} UpdateDiscountCodePayload
 */
export default async function updateDiscountCode(context, input) {
  const { _id, ...discountCodeInput } = input;
  const { appEvents, collections } = context;
  const { Discounts } = collections;
  const { shopId } = discountCodeInput;

  await context.validatePermissions(`reaction:legacy:discounts:${_id}`, "update", { shopId });

  DiscountCodesSchema.validate(discountCodeInput);

  await Discounts.updateOne({
    _id,
    shopId
  }, {
    $set: {
      ...discountCodeInput
    }
  });

  const updatedDiscountCode = await Discounts.findOne({ _id });

  await appEvents.emit("afterDiscountCodeUpdate", updatedDiscountCode);

  return updatedDiscountCode;
}
