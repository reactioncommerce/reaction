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
  // Check for owner or admin permissions from the user before allowing the mutation
  const {
    _id,
    shopId,
    code,
    discount,
    accountLimit,
    redemptionLimit,
    calculation,
    discountMethod
  } = input;
  const { appEvents, checkPermissions, collections } = context;
  const { DiscountCodes } = collections;

  await checkPermissions(["admin", "owner"], shopId);

  const discountCode = {
    code,
    discount,
    conditions: {
      accountLimit,
      redemptionLimit
    },
    calculation,
    discountMethod
  };

  DiscountCodesSchema.validate(discountCode);

  await DiscountCodes.updateOne({
    _id,
    shopId
  }, {
    $set: discountCode
  });

  const updatedDiscountCode = await DiscountCodes.findOne({ _id });

  await appEvents.emit("afterDiscountCodeCreate", updatedDiscountCode);

  return updatedDiscountCode;
}
