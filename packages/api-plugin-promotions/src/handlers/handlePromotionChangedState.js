import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";


const require = createRequire(import.meta.url);

const pkg = require("../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "handlePromotionActivated.js"
};

/**
 * @summary get all the registered carts
 * @param {Object} context - The application context
 * @return {Promise<Array<String>>} - An array of cart ids
 */
async function getCarts(context) {
  const { collections: { Cart } } = context;
  const registeredCartsCursor = await Cart.find({}, { cartId: 1 });
  return registeredCartsCursor;
}

/**
 * @summary when a promotion becomes active, process all the existing carts
 * @param {Object} context - The application context
 * @return {Promise<{ anonymousCarts, registeredCarts }>} the lists of carts to reprocess
 */
export default async function handlePromotionChangedState(context) {
  Logger.info(logCtx, "Reprocessing all old carts for promotion has changed state");
  const { bullQueue } = context;
  const cartsCursor = await getCarts(context);
  const carts = [];
  let totalCarts = 0;
  cartsCursor.forEach((cart) => {
    carts.push(cart._id);
    if (carts.length >= 500) {
      bullQueue.addJob(context, "checkExistingCarts", carts);
      totalCarts += carts.length;
      carts.length = 0; // empty this array
    }
    // process remainder when batch < 500
    if (carts.length) {
      bullQueue.addJob(context, "checkExistingCarts", carts);
      totalCarts += carts.length;
    }
  });
  Logger.info({ totalCarts, ...logCtx }, "Completed processing existing carts for Promotions");
  return { totalCarts };
}
