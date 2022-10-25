import applyExplicitPromotion from "../handlers/applyExplicitPromotion";
import applyExplicitPromotionToCart from "./applyExplicitPromotionToCart.js";

jest.mock("../handlers/applyExplicitPromotion.js", () => jest.fn().mockName("applyExplicitPromotion"));

test("call applyExplicitPromotion function", async () => {
  const context = { collections: { Cart: { findOne: jest.fn().mockName("findOne") } } };
  const cart = { _id: "cartId" };
  const promotion = { _id: "promotionId" };
  applyExplicitPromotionToCart(context, cart, promotion);
  expect(applyExplicitPromotion).toHaveBeenCalledWith(context, cart, promotion);
});
