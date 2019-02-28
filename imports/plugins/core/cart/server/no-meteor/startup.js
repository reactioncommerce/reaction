import Logger from "@reactioncommerce/logger";

const AFTER_CATALOG_UPDATE_EMITTED_BY_NAME = "CART_CORE_PLUGIN_AFTER_CATALOG_UPDATE";

/**
 * @param {Object} appEvents App event emitter
 * @param {Object} Cart Cart collection
 * @param {Object} pricing Potentially updated pricing map for the variant
 * @param {String} variantId The ID of the variant to update for
 * @returns {Promise<null>} Promise that resolves with null
 */
async function updateAllCartsForVariant({ appEvents, Cart, pricing, variantId, queries }) {
  // Do find + update because we need the `cart.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in carts at the same time.
  const carts = await Cart.find({
    "items.variantId": variantId
  }, {
    projection: { _id: 1, currencyCode: 1, items: 1 }
  }).toArray();

  await Promise.all(carts.map(async (cart) => {
    const prices = pricing[cart.currencyCode];
    if (!prices) return;

    const { didUpdate, updatedItems } = queries.updateCartItemsForVariantPriceChange(cart.items, variantId, prices);
    if (!didUpdate) return;

    // Update the cart
    const { result } = await Cart.updateOne({
      _id: cart._id
    }, {
      $set: {
        items: updatedItems,
        updatedAt: new Date()
      }
    });
    if (result.ok !== 1) {
      Logger.warn(`MongoDB error trying to update cart ${cart._id} in "afterPublishProductToCatalog" listener. Check MongoDB logs.`);
      return;
    }

    // Emit "after update"
    const updatedCart = await Cart.findOne({ _id: cart._id });
    appEvents.emit("afterCartUpdate", {
      cart: updatedCart,
      updatedBy: null
    }, { emittedBy: AFTER_CATALOG_UPDATE_EMITTED_BY_NAME });
  }));

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections, queries } = context;
  const { Cart } = collections;

  // When an order is created, delete the source cart
  appEvents.on("afterOrderCreate", async ({ order }) => {
    const { cartId } = order;
    if (cartId) {
      const { result } = await Cart.deleteOne({ _id: cartId });
      if (result.ok !== 1) {
        Logger.warn(`MongoDB error trying to delete cart ${cartId} in "afterOrderCreate" listener. Check MongoDB logs.`);
      }
    }
  });

  // When a variant's price changes, change the `price` and `subtotal` fields of all CartItems for that variant.
  // When a variant's compare-at price changes, change the `compareAtPrice` field of all CartItems for that variant.
  appEvents.on("afterPublishProductToCatalog", async ({ catalogProduct }) => {
    const { variants } = catalogProduct;

    // Build a map of variant IDs to their potentially-changed prices
    const variantPricingMap = queries.getVariantPricingMap(variants);
    const variantIds = Object.keys(variantPricingMap);

    // Update all cart items that are linked with the updated variants
    await Promise.all(variantIds.map(async (variantId) => {
      const pricing = variantPricingMap[variantId];
      return updateAllCartsForVariant({ appEvents, Cart, pricing, variantId, queries });
    }));
  });
}
