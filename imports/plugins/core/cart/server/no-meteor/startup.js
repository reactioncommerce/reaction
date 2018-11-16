import Logger from "@reactioncommerce/logger";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart } = collections;

  // When an order is created, delete the source cart
  appEvents.on("afterOrderCreate", async (order) => {
    const { cartId } = order;
    if (cartId) {
      const { result } = await Cart.deleteOne({ _id: cartId });
      if (result.ok !== 1) {
        Logger.warn(`MongoDB error trying to delete cart ${cartId} in "afterOrderCreate" listener. Check MongoDB logs.`);
      }
    }
  });

  // When a variant's price changes, change the `price` field of all CartItems for that variant, too
  appEvents.on("afterPublishProductToCatalog", async (product, catalogProduct) => {
    const { variants } = catalogProduct;

    // Build a map of variant IDs to their potentially-changed prices
    const variantPricingMap = {};
    variants.forEach((variant) => {
      variantPricingMap[variant.variantId] = variant.pricing;
      if (variant.options) {
        variant.options.forEach((option) => {
          variantPricingMap[option.variantId] = option.pricing;
        });
      }
    });

    // Update all cart items that are linked with the updated variants
    await Promise.all(Object.keys(variantPricingMap).map(async (variantId) => {
      const pricing = variantPricingMap[variantId];

      // Do find + update because we need the `cart.currencyCode` to figure out pricing
      const carts = await Cart.find({
        "items.variantId": variantId
      }, {
        projection: { _id: 1, currencyCode: 1 }
      }).toArray();

      return Promise.all(carts.map(async (cart) => {
        const prices = pricing[cart.currencyCode];
        if (!prices) return Promise.resolve();

        return Cart.updateMany({
          _id: cart._id
        }, {
          $set: {
            "items.$[elem].compareAtPrice.amount": prices.compareAtPrice,
            "items.$[elem].price.amount": prices.price,
            "updatedAt": new Date()
          }
        }, {
          arrayFilters: [
            { "elem.variantId": variantId }
          ]
        });
      }));
    }));
  });
}
