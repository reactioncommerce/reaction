import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import evaluateRulesAgainstShipping from "./evaluateRulesAgainstShipping.js";

const require = createRequire(import.meta.url);

const pkg = require("../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyShippingDiscountToCart.js"
};

/**
 * @summary Add the discount to the shipping record
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to apply
 * @param {Object} param.shipping - The shipping record to apply the discount to
 * @returns {Promise<void>} undefined
 */
async function addDiscountToShipping(context, params, { shipping }) {
  for (const shippingRecord of shipping) {
    if (shippingRecord.discounts) {
      const { promotion: { _id: promotionId }, actionKey } = params;
      const existingDiscount = shippingRecord.discounts
        .find((itemDiscount) => actionKey === itemDiscount.actionKey && promotionId === itemDiscount.promotionId);
      if (existingDiscount) {
        Logger.warn(logCtx, "Not adding discount because it already exists");
        return;
      }
    }
    const cartDiscount = createShippingDiscount(shippingRecord, params);
    if (shippingRecord.discounts) {
      shippingRecord.discounts.push(cartDiscount);
    } else {
      shippingRecord.discounts = [cartDiscount];
    }
  }
}

/**
 * @summary Create a discount object for a shipping record
 * @param {Object} item - The cart item
 * @param {Object} params - The action parameters
 * @returns {Object} - The shipping discount object
 */
function createShippingDiscount(item, params) {
  const { promotion: { _id }, actionParameters, actionKey } = params;
  const shippingDiscount = {
    actionKey,
    promotionId: _id,
    rules: actionParameters.rules,
    discountCalculationType: actionParameters.discountCalculationType,
    discountValue: actionParameters.discountValue,
    dateApplied: new Date()
  };
  return shippingDiscount;
}

/**
 * @summary Apply a shipping discount to a cart
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to apply
 * @param {Object} cart - The cart to apply the discount to
 * @returns {Promise<Object>} The updated cart
 */
export default async function applyShippingDiscountToCart(context, params, cart) {
  Logger.info(logCtx, "Applying shipping discount");
  const { shipping } = cart;
  await addDiscountToShipping(context, params, { shipping });

  // Check existing shipping quotes and discount them
  Logger.info("Check existing shipping quotes and discount them");
  for (const shippingRecord of shipping) {
    if (!shippingRecord.shipmentQuotes) continue;
    // evaluate whether a discount applies to the existing shipment quotes
    // eslint-disable-next-line no-await-in-loop
    await evaluateRulesAgainstShipping(context, shippingRecord);
  }

  return { cart };
}
