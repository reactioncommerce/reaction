import { createRequire } from "module";
import { Engine } from "json-rules-engine";
import Logger from "@reactioncommerce/logger";

const require = createRequire(import.meta.url);

const pkg = require("../../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyItemDiscountToCart.js"
};

function createItemDiscount(item, discount) {
  const itemDiscount = {
    _id: discount._id,
    discountLabel: discount.label,
    cartDescriptionByLanguage: [
      {
        language: "en",
        content: discount.label
      }
    ],
    discountCalculationType: discount.discountCalculationType,
    discountValue: discount.discountValue,
    dateApplied: new Date()
  };
  return itemDiscount;
}

function recalculateSubtotal(context, item) {
  let totalDiscount = 0;
  const amountBeforeDiscounts = item.price.amount * item.quantity;
  item.discounts.forEach((discount) => {
    const calculationMethod = context.promotions.methods[discount.discountCalculationType];
    const discountAmount = calculationMethod(discount.discountValue, amountBeforeDiscounts);
    totalDiscount += discountAmount;
  });
  if (totalDiscount < item.subtotal.amount) {
    item.subtotal.amount = amountBeforeDiscounts - totalDiscount;
  }
}

async function addDiscountToItem(context, discount, { item }) {
  const existingDiscount = item.discounts.find((itemDiscount) => discount._id === itemDiscount._id);
  if (existingDiscount) {
    Logger.warn(logCtx, "Not adding discount because it already exists");
    return;
  }
  const cartDiscount = createItemDiscount(item, discount);
  item.discounts.push(cartDiscount);
  recalculateSubtotal(context, item);
}

export default async function applyItemDiscountToCart(context, discount, cart) {
  const allResults = [];
  const discountedItems = [];
  const { promotions: { operators } } = context;
  if (discount.inclusionRules) {
    const engine = new Engine();
    engine.addRule(discount.inclusionRules);
    Object.keys(operators).forEach((operatorKey) => {
      engine.addOperator(operatorKey, operators[operatorKey]);
    });

    for (const item of cart.items) {
      engine.on("success", (event, almanac, ruleResult) => {
        discountedItems.push(item);
        addDiscountToItem(context, discount, { item });
      });
      const facts = { item };
      // eslint-disable-next-line no-await-in-loop
      const results = await engine.run(facts);
      allResults.push(results);
    }
  }
  if (discountedItems.length) {
    Logger.info(logCtx, "Saved Discount to cart");
  }

  return { cart, allResults, discountedItems };
}
