import { isEqual } from "lodash";
import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";

/**
 * @summary Returns `cart.items` with tax-related props updated on them
 * @param {Object} cart The cart
 * @param {Object} context App context
 * @returns {Object[]} Updated items array
 */
async function getUpdatedCartItems(cart, context) {
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

const EMITTED_BY_NAME = "TAXES_CORE_PLUGIN";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart } = collections;

  // This entire hook is doing just one thing: Updating the tax-related props
  // on each item in the cart, and saving those changes to the database if any of them
  // have changed.
  appEvents.on("afterCartUpdate", async ({ cart }, { emittedBy } = {}) => {
    if (emittedBy === EMITTED_BY_NAME) return; // short circuit infinite loops

    const { cartItems, taxSummary } = await getUpdatedCartItems(cart, context);

    if (isEqual(cartItems, cart.items) && isEqual(taxSummary, cart.taxSummary)) return;

    const { matchedCount } = await Cart.updateOne({ _id: cart._id }, {
      $set: {
        items: cartItems,
        taxSummary
      }
    });
    if (matchedCount === 0) throw new Error("Unable to update cart");

    appEvents.emit("afterCartUpdate", { cart: { ...cart, items: cartItems }, updatedBy: null }, { emittedBy: EMITTED_BY_NAME });
  });
}
