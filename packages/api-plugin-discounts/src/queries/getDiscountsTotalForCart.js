/**
 * @summary Calculates total discount amount for a cart based on all discounts
 *   that have been applied to it
 * @param {Object} context Context object
 * @param {Object} cart The cart to get discounts from
 * @returns {Object} Object with `discounts` array and `total`
 */
export default async function getDiscountsTotalForCart(context, cart) {
  const { collections } = context;
  const { Discounts } = collections;

  // Currently, discounts are added as items in the billing array
  let discounts = await Promise.all((cart.billing || []).map(async (billing) => {
    const { data, processor } = billing;

    // If it has a discountId, it's a discount
    if (!data || !data.discountId) return null;

    const discount = await Discounts.findOne({ _id: data.discountId });
    const calculation = discount && discount.calculation && discount.calculation.method;
    if (!calculation) return null;

    const funcs = context.getFunctionsOfType(`discounts/${processor}s/${calculation}`); // note the added "s"
    if (funcs.length === 0) throw new Error(`No functions of type "discounts/${processor}s/${calculation}" have been registered`);

    const amount = await funcs[0](cart._id, discount._id, collections);
    return { discountId: data.discountId, amount };
  }));

  // Remove nulls
  discounts = discounts.filter((val) => !!val);

  // Discounts are additive, if we allow more than one
  return {
    discounts,
    total: discounts.reduce((sum, discount) => sum + discount.amount, 0)
  };
}
