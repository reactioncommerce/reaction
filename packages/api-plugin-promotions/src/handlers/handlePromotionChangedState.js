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
async function getRegisteredCarts(context) {
  const { collections: { Carts } } = context;
  const registeredCarts = await Carts.find({ anonymousCartId: { $exists: false } }, { cartId: 1 }).toArray();
  return registeredCarts;
}

/**
 * @summary get all the anonymous carts
 * @param {Object} context - The application context
 * @return {Promise<Array<String>>} - An array of cart ids
 */
async function getAnonymousCarts(context) {
  const { collections: { Carts } } = context;
  const anonymousCarts = await Carts.find({ anonymousCartId: { $exists: true } }, { cartId: 1 }).toArray();
  return anonymousCarts;
}


/**
 * @summary when a promotion becomes active, process all the existing carts
 * @param {Object} context - The application context
 * @return {Promise<{ anonymousCarts, registeredCarts }>} the lists of carts to reprocess
 */
export default async function handlePromotionChangedState(context) {
  Logger.info(logCtx, "Reprocessing all old carts for promotion has changed state");
  const { bullQueue } = context;
  const registeredCarts = await getRegisteredCarts(context);
  bullQueue.addJob(context, "checkExistingCarts", registeredCarts);
  const anonymousCarts = await getAnonymousCarts(context);
  bullQueue.addJob(context, "checkExistingCarts", anonymousCarts);
  return { anonymousCarts, registeredCarts };
}
