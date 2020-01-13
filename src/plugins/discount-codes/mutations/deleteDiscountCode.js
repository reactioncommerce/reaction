/**
 * @name Mutation.deleteDiscountCode
 * @method
 * @memberof GraphQL/discount-codes
 * @summary Delete a discount code
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} DeleteDiscountCodePayload
 */
export default async function deleteDiscountCode(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const {
    _id,
    shopId
  } = input;
  const { appEvents, collections } = context;
  const { Discounts } = collections;

  await context.validatePermissions(`reaction:legacy:discounts:${_id}`, "delete", { shopId, legacyRoles: ["owner", "admin"] });

  const discountCodeToRemove = await Discounts.findOne({
    _id,
    shopId
  });

  await Discounts.removeOne({
    _id,
    shopId
  });

  await appEvents.emit("afterDiscountCodeRemove", discountCodeToRemove);

  return discountCodeToRemove;
}
