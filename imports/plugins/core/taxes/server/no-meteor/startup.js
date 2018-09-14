import { isEqual } from "lodash";
import appEvents from "/imports/node-app/core/util/appEvents";
import getFulfillmentGroupItemsWithTaxAdded from "./mutations/getFulfillmentGroupItemsWithTaxAdded";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Cart } = collections;

  // This entire hook is doing just one thing: Updating the `taxRate` and `tax` props
  // on each item in the cart, and saving those changes to the database if any of them
  // have changed.
  appEvents.on("afterCartUpdate", async (cart) => {
    // This dance is because `getFulfillmentGroupItemsWithTaxAdded` takes groups with `items` on them,
    // like in the Order schema, whereas in the Cart schema, items are directly on the cart
    // and each group has only `itemIds` on it. So we first adjust each group to look like
    // an order fulfillment group.
    //
    // Also, effectiveTaxRate is on the cart rather than the group.
    const itemsWithTax = await Promise.all(cart.shipping.map(async (group) => {
      let items = group.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId));
      items = items.filter((item) => !!item); // remove nulls

      // We also need to add `subtotal` on each item, based on the current price of that item in
      // the catalog. `getFulfillmentGroupItemsWithTaxAdded` uses subtotal prop to calculate the tax.
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

      return getFulfillmentGroupItemsWithTaxAdded(collections, { ...group, items });
    }));

    const cartItems = cart.items.map((item) => {
      const newItem = { ...item, taxRate: 0, tax: 0 };
      itemsWithTax.forEach((group) => {
        group.forEach((groupItem) => {
          if (groupItem._id === item._id) {
            newItem.taxRate = groupItem.taxRate;
            newItem.tax = groupItem.tax;
          }
        });
      });
      return newItem;
    });

    if (isEqual(cartItems, cart.items)) return;

    const { matchedCount } = await Cart.updateOne({ _id: cart._id }, {
      $set: {
        items: cartItems
      }
    });
    if (matchedCount === 0) throw new Error("Unable to update cart");
  });
}
