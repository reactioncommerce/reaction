import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

export const MAX_CART_COUNT = 50;
const logCtx = { name: "cart", file: "saveManyCarts" };

/**
 * @summary Takes a new or updated cart, runs it through all registered transformations,
 *   validates, and upserts to database.
 * @param {Object} context - App context
 * @param {Object[]} carts - The carts to transform and insert or replace. There is a limit
 *   of 50 carts. If the array has more than 50 items, an error is thrown.
 * @returns {undefined}
 */
export default async function saveManyCarts(context, carts) {
  const { appEvents, collections: { Cart } } = context;

  if (!Array.isArray(carts) || carts.length > MAX_CART_COUNT) {
    throw new ReactionError("invalid-param", `carts must be an array of ${MAX_CART_COUNT} or fewer carts`);
  }

  // Transform and validate each cart and then add to `bulkWrites` array
  const bulkWritePromises = carts.map(async (cart) => {
    // Mutates `cart`
    await context.mutations.transformAndValidateCart(context, cart);

    return {
      replaceOne: {
        filter: { _id: cart._id },
        replacement: cart,
        upsert: true
      }
    };
  });

  const bulkWrites = await Promise.all(bulkWritePromises);

  let writeErrors;
  try {
    Logger.trace({ ...logCtx, bulkWrites }, "Running bulk op");
    const bulkWriteResult = await Cart.bulkWrite(bulkWrites, { ordered: false });
    ({ writeErrors } = bulkWriteResult.result);
  } catch (error) {
    if (!error.result || typeof error.result.getWriteErrors !== "function") throw error;
    // This happens only if all writes fail. `error` object has the result on it.
    writeErrors = error.result.getWriteErrors();
  }

  // Figure out which failed and which succeeded. Emit "after update" or log error
  const cartIds = [];
  await Promise.all(carts.map(async (cart, index) => {
    // If updating this cart failed, log the error details and stop
    const writeError = writeErrors.find((writeErr) => writeErr.index === index);
    if (writeError) {
      Logger.error({
        ...logCtx,
        errorCode: writeError.code,
        errorMsg: writeError.errmsg,
        cartId: cart._id
      }, "MongoDB writeError saving cart");
      return;
    }

    cartIds.push(cart._id);
    appEvents.emit("afterCartUpdate", { cart, updatedBy: null });
  }));

  Logger.debug({ ...logCtx, cartIds }, "Successfully saved multiple carts");
}
