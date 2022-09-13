import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import evaluateRulesAgainstShipping from "./evaluateRulesAgainstShipping.js";

const require = createRequire(import.meta.url);

const pkg = require("../../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyShippingDiscountToCart.js"
};

async function addDiscountToShipping(context, discount, { shipping }) {
  for (const shippingRecord of shipping) {
    if (shippingRecord.discounts) {
      const existingDiscount = shippingRecord.discounts.find((itemDiscount) => discount._id === itemDiscount._id);
      if (existingDiscount) {
        Logger.warn(logCtx, "Not adding discount because it already exists");
        return;
      }
    }
    const cartDiscount = createShippingDiscount(shippingRecord, discount);
    if (shippingRecord.discounts) {
      shippingRecord.discounts.push(cartDiscount);
    } else {
      shippingRecord.discounts = [cartDiscount];
    }
  }
}


function createShippingDiscount(item, discount) {
  const shippingDiscount = {
    _id: discount._id,
    discountLabel: discount.label,
    cartDescriptionByLanguage: [
      {
        language: "en",
        content: discount.label
      }
    ],
    inclusionRules: discount.inclusionRules,
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date()
  };
  return shippingDiscount;
}


async function checkExistingQuotesForDiscount(context, shipping) {
  // Check existing shipping quotes and discount them
  Logger.info("Check existing shipping quotes and discount them");
  for (const shippingRecord of shipping) {
    if (!shippingRecord.shipmentQuotes) continue;
    // evaluate whether a discount applies to the existing shipment quotes
    // eslint-disable-next-line no-await-in-loop
    await evaluateRulesAgainstShipping(context, shippingRecord);
  }
}

export default async function applyShippingDiscountToCart(context, discount, cart) {
  Logger.info(logCtx, "Applying shipping discount");
  const { shipping } = cart;
  await addDiscountToShipping(context, discount, { shipping });
  await checkExistingQuotesForDiscount(context, shipping);
  return { cart };
}
