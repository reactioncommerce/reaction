import Logger from "@reactioncommerce/logger";
import updateCartItemsForVariantPriceChange from "./util/updateCartItemsForVariantPriceChange";

const AFTER_CATALOG_UPDATE_EMITTED_BY_NAME = "CART_CORE_PLUGIN_AFTER_CATALOG_UPDATE";
const BULK_WRITE_LIMIT = 50;

const logCtx = { name: "cart", file: "startup", fn: "updateAllCartsForVariant" };

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
  const { appEvents, queries } = context;
  const { variantId } = variant;

  Logger.debug({ ...logCtx, variantId }, "Running updateAllCartsForVariant");

  let bulkWrites = [];

  /**
   * @summary Pass `bulkWrites` array to Cart.bulkWrite and then clear the array.
   * @return {undefined}
   */
  async function flushBulkWrites() {
    if (bulkWrites.length === 0) return;

    let writeErrors;
    try {
      Logger.trace({ ...logCtx, bulkWrites }, "Running bulk op");
      const bulkWriteResult = await Cart.bulkWrite(bulkWrites, { ordered: false });
      ({ writeErrors } = bulkWriteResult.result);
    } catch (error) {
      // This happens only if all writes fail. `error` object has the result on it.
      writeErrors = error.result.getWriteErrors();
    }

    // Figure out which failed and which succeeded
    const updatedCartIds = [];
    bulkWrites.forEach((bulkWrite, index) => {
      const cartId = bulkWrite.updateOne.filter._id;

      // If updating this cart failed, log the error details and stop
      const writeError = writeErrors.find((writeErr) => writeErr.index === index);
      if (writeError) {
        Logger.error({
          ...logCtx,
          errorCode: writeError.code,
          errorMsg: writeError.errmsg,
          cartId
        }, "MongoDB writeError updating cart prices after catalog publish");
        return;
      }

      // For now we're just going to make a list of which were updated successfully.
      // This way we can do a single `find` to get them for the "afterCartUpdate" emit
      // rather than a bunch of `findOne`.
      updatedCartIds.push(cartId);
    });

    bulkWrites = [];

    if (updatedCartIds.length === 0) return;

    // Emit "after update"
    const updatedCarts = await Cart.find({ _id: { $in: updatedCartIds } }).toArray();
    await Promise.all(updatedCarts.map(async (updatedCart) => {
      Logger.debug({ ...logCtx, cartId: updatedCart._id }, "Successfully updated cart prices after catalog publish");
      await appEvents.emit("afterCartUpdate", {
        cart: updatedCart,
        updatedBy: null
      }, { emittedBy: AFTER_CATALOG_UPDATE_EMITTED_BY_NAME });
    }));
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

    const { didUpdate, updatedItems } = updateCartItemsForVariantPriceChange(cart.items, variantId, prices);
    if (!didUpdate) return;

    bulkWrites.push({
      updateOne: {
        filter: { _id: cart._id },
        update: {
          $set: {
            items: updatedItems,
            updatedAt: new Date()
          }
        }
      }
    });
  }

  // Do find + update because we need the `cart.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in carts at the same time.
  const cartsCursor = Cart.find({
    "items.variantId": variantId
  }, {
    projection: { _id: 1, currencyCode: 1, items: 1 }
  });

  /* eslint-disable no-await-in-loop */
  let cart = await cartsCursor.next();
  while (cart) {
    await updateOneCart(cart);

    if (bulkWrites.length >= BULK_WRITE_LIMIT) {
      await flushBulkWrites();
    }

    cart = await cartsCursor.next();
  }
  /* eslint-enable no-await-in-loop */

  // Flush remaining bulk writes
  await flushBulkWrites();

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
