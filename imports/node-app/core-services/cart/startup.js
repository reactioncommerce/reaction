import Logger from "@reactioncommerce/logger";
import updateCartItemsForVariantChanges from "./util/updateCartItemsForVariantChanges.js";
import { MAX_CART_COUNT as SAVE_MANY_CARTS_LIMIT } from "./mutations/saveManyCarts.js";

const logCtx = { name: "cart", file: "startup" };

/**
 * @param {Object[]} catalogProductVariants The `product.variants` array from a catalog item
 * @returns {Object[]} All variants and their options flattened in one array
 */
function getFlatVariantsAndOptions(catalogProductVariants) {
  const variants = [];

  catalogProductVariants.forEach((variant) => {
    variants.push(variant);
    if (variant.options) {
      variant.options.forEach((option) => {
        variants.push(option);
      });
    }
  });

  return variants;
}

/**
 * @param {Object} Cart Cart collection
 * @param {Object} context App context
 * @param {String} variant The catalog product variant or option
 * @returns {Promise<null>} Promise that resolves with null
 */
async function updateAllCartsForVariant({ Cart, context, variant }) {
  const { mutations, queries } = context;
  const { variantId } = variant;

  Logger.debug({ ...logCtx, variantId, fn: "updateAllCartsForVariant" }, "Running updateAllCartsForVariant");

  let updatedCarts = [];

  /**
   * @summary Bulk save an array of updated carts
   * @return {undefined}
   */
  async function saveCarts() {
    if (updatedCarts.length === 0) return;
    await mutations.saveManyCarts(context, updatedCarts);
    updatedCarts = [];
  }

  /**
   * @summary Get updated prices for a single cart, and check whether there are any changes.
   *   If so, push into `bulkWrites` array.
   * @param {Object} cart The cart
   * @return {undefined}
   */
  async function updateOneCart(cart) {
    const prices = await queries.getVariantPrice(context, variant, cart.currencyCode);
    if (!prices) return;

    const { didUpdate, updatedItems } = updateCartItemsForVariantChanges(cart.items, variant, prices);
    if (!didUpdate) return;

    updatedCarts.push({ ...cart, items: updatedItems });
  }

  // Do find + update because we need the `cart.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in carts at the same time.
  const cartsCursor = Cart.find({ "items.variantId": variantId });

  /* eslint-disable no-await-in-loop */
  let cart = await cartsCursor.next();
  while (cart) {
    await updateOneCart(cart);

    if (updatedCarts.length === SAVE_MANY_CARTS_LIMIT) {
      await saveCarts();
    }

    cart = await cartsCursor.next();
  }
  /* eslint-enable no-await-in-loop */

  // Flush remaining cart updates
  await saveCarts();

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const { appEvents, collections } = context;
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

  // Propagate any price changes to all corresponding cart items
  appEvents.on("afterPublishProductToCatalog", async ({ catalogProduct }) => {
    const { _id: catalogProductId, variants } = catalogProduct;

    Logger.debug({ ...logCtx, catalogProductId, fn: "startup" }, "Running afterPublishProductToCatalog");

    const variantsAndOptions = getFlatVariantsAndOptions(variants);

    // Update all cart items that are linked with the updated variants.
    await Promise.all(variantsAndOptions.map((variant) => updateAllCartsForVariant({ Cart, context, variant })));
  });
}
