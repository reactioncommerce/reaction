import { isEqual } from "lodash";

/**
 * @summary Returns `cart.items` with tax-related props updated on them
 * @param {Object} cart The cart
 * @param {Object} context App context
 * @returns {Object[]} Updated items array
 */
async function getUpdatedCartItems(cart, context) {
  const { collections } = context;

  // This dance is because `getFulfillmentGroupTaxes` takes groups with `items` on them,
  // like in the Order schema, whereas in the Cart schema, items are directly on the cart
  // and each group has only `itemIds` on it. So we first adjust each group to look like
  // an order fulfillment group.
  const taxSummaries = [];
  const itemsWithTax = await Promise.all(cart.shipping.map(async (group) => {
    let items = group.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId));
    items = items.filter((item) => !!item); // remove nulls

    // We also need to add `subtotal` on each item, based on the current price of that item in
    // the catalog. `getFulfillmentGroupTaxes` uses subtotal prop to calculate the tax.
    items = await Promise.all(items.map(async (item) => {
      const productConfiguration = {
        productId: item.productId,
        productVariantId: item.variantId
      };
      const {
        price
      } = await context.queries.getCurrentCatalogPriceForProductConfiguration(productConfiguration, cart.currencyCode, collections);

      return {
        ...item,
        subtotal: price * item.quantity
      };
    }));

    const {
      items: groupItemsWithTaxAdded,
      taxSummary
    } = await context.mutations.getFulfillmentGroupTaxes(context, { ...group, items }, false);

    taxSummaries.push(taxSummary);

    return groupItemsWithTaxAdded;
  }));

  const cartItems = cart.items.map((item) => {
    const newItem = { ...item };
    itemsWithTax.forEach((group) => {
      const matchingGroupItem = group.find((groupItem) => groupItem._id === item._id);
      if (matchingGroupItem) {
        newItem.tax = matchingGroupItem.tax;
        newItem.taxableAmount = matchingGroupItem.taxableAmount;
        newItem.taxes = matchingGroupItem.taxes;
      }
    });
    return newItem;
  });

  // Reduce all group tax summaries to a single one
  const taxSummary = taxSummaries.reduce((combinedSummary, groupSummary) => {
    // groupSummary will be null if there wasn't enough info to calc taxes
    if (!combinedSummary || !groupSummary) return null;

    combinedSummary.calculatedAt = groupSummary.calculatedAt;
    combinedSummary.tax += groupSummary.tax;
    combinedSummary.taxableAmount += groupSummary.taxableAmount;
    combinedSummary.taxes = combinedSummary.taxes.concat(groupSummary.taxes);

    return combinedSummary;
  }, { tax: 0, taxableAmount: 0, taxes: [] });

  return { cartItems, taxSummary };
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
  appEvents.on("afterCartUpdate", async (cart, { emittedBy } = {}) => {
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

    appEvents.emit("afterCartUpdate", { ...cart, items: cartItems }, { emittedBy: EMITTED_BY_NAME });
  });
}
