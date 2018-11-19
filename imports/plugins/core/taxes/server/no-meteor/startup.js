import { isEqual } from "lodash";

/**
 * @param {Object} cart A cart
 * @param {Object} group The cart fulfillment group
 * @param {Object} context App context
 * @returns {Object} Valid TaxServiceOrderInput from a cart group
 */
async function buildOrderInputForTaxCalculation(cart, group, context) {
  const { collections } = context;
  const { currencyCode } = cart;

  let items = group.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId));
  items = items.filter((item) => !!item); // remove nulls

  // We also need to add `subtotal` on each item, based on the current price of that item in
  // the catalog. `getFulfillmentGroupTaxes` uses subtotal prop to calculate the tax.
  items = items.map((item) => ({
    _id: item._id,
    isTaxable: item.isTaxable,
    parcel: item.parcel,
    price: item.price,
    quantity: item.quantity,
    shopId: item.shopId,
    subtotal: {
      amount: item.price.amount * item.quantity,
      currencyCode
    },
    taxCode: item.taxCode,
    variantId: item.variantId
  }));

  const { address, shipmentMethod, shopId, type: fulfillmentType } = group;
  const shop = await collections.Shops.findOne({ _id: shopId });

  return {
    currencyCode: cart.currencyCode,
    fulfillmentPrices: {
      handling: {
        amount: (shipmentMethod && shipmentMethod.handling) || 0,
        currencyCode
      },
      shipping: {
        amount: (shipmentMethod && shipmentMethod.rate) || 0,
        currencyCode
      },
      total: {
        amount: shipmentMethod ? ((shipmentMethod.handling || 0) + (shipmentMethod.rate || 0)) : 0,
        currencyCode
      }
    },
    fulfillmentType,
    items,
    originAddress: (shop && Array.isArray(shop.addressBook) && shop.addressBook[0]) || null,
    shippingAddress: address || null,
    shopId
  };
}

/**
 * @summary Returns `cart.items` with tax-related props updated on them
 * @param {Object} cart The cart
 * @param {Object} context App context
 * @returns {Object[]} Updated items array
 */
async function getUpdatedCartItems(cart, context) {
  const taxResultsByGroup = await Promise.all(cart.shipping.map(async (group) => {
    const order = await buildOrderInputForTaxCalculation(cart, group, context);
    return context.mutations.getFulfillmentGroupTaxes(context, { order, forceZeroes: false });
  }));

  // Add tax properties to all items in the cart, if taxes were able to be calculated
  const cartItems = cart.items.map((item) => {
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
