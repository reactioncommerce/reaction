import { createRequire } from "module";
import Logger from "@reactioncommerce/logger";
import applyItemDiscountToCart from "./discountTypes/item/applyItemDiscountToCart.js";
import applyShippingDiscountToCart from "./discountTypes/shipping/applyShippingDiscountToCart.js";
import applyOrderDiscountToCart from "./discountTypes/order/applyOrderDiscountToCart.js";

const require = createRequire(import.meta.url);

const pkg = require("../../../../package.json");

const { name, version } = pkg;
const logCtx = {
  name,
  version,
  file: "util/applyDiscountToCart.js"
};

const functionMap = {
  item: applyItemDiscountToCart,
  shipping: applyShippingDiscountToCart,
  order: applyOrderDiscountToCart
};


export default async function applyDiscountToCart(context, params, cart) {
  Logger.info({ params, cartId: cart._id, ...logCtx }, "applying discount to cart");
  const { discount } = params;
  if (!discount) {
    Logger.warn(logCtx, "Could not find discount to apply. Taking no action");
    return;
  }
  const { cart: updatedCart } = await functionMap[discount.discountType](context, discount, cart);
  context.mutations.saveCart(context, updatedCart, "promotions");
  Logger.info(logCtx, "Completed applying Discount to Cart");
}
