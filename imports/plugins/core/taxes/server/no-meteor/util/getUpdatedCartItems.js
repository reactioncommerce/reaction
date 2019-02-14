import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";

/**
 * @summary Returns `cart.items` with tax-related props updated on them
 * @param {Object} context App context
 * @param {Object} cart The cart
 * @returns {Object[]} Updated items array
 */
export default async function getUpdatedCartItems(context, cart) {
  const taxResultsByGroup = await Promise.all((cart.shipping || []).map(async (group) => {
    const order = await xformCartGroupToCommonOrder(cart, group, context);
    return context.mutations.getFulfillmentGroupTaxes(context, { order, forceZeroes: false });
  }));

  // Add tax properties to all items in the cart, if taxes were able to be calculated
  const cartItems = (cart.items || []).map((item) => {
    const newItem = { ...item };
    taxResultsByGroup.forEach((group) => {
      const matchingGroupTaxes = group.itemTaxes.find((groupItem) => groupItem.itemId === item._id);
      if (matchingGroupTaxes) {
        newItem.tax = matchingGroupTaxes.tax;
        newItem.taxableAmount = matchingGroupTaxes.taxableAmount;
        newItem.taxes = matchingGroupTaxes.taxes;
      }
    });
    return newItem;
  });

  // Merge all group tax summaries to a single one for the whole cart
  let combinedSummary = { tax: 0, taxableAmount: 0, taxes: [] };
  for (const { taxSummary } of taxResultsByGroup) {
    // groupSummary will be null if there wasn't enough info to calc taxes
    if (!taxSummary) {
      combinedSummary = null;
      break;
    }

    combinedSummary.calculatedAt = taxSummary.calculatedAt;
    combinedSummary.calculatedByTaxServiceName = taxSummary.calculatedByTaxServiceName;
    combinedSummary.tax += taxSummary.tax;
    combinedSummary.taxableAmount += taxSummary.taxableAmount;
    combinedSummary.taxes = combinedSummary.taxes.concat(taxSummary.taxes);
  }

  return { cartItems, taxSummary: combinedSummary };
}
