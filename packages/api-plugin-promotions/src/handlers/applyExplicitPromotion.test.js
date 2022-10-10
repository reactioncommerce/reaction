import applyPromotions from "./applyPromotions.js";
import applyExplicitPromotion from "./applyExplicitPromotion.js";

jest.mock("../handlers/applyPromotions.js", () => jest.fn().mockName("applyPromotions"));

test("call applyPromotions function", async () => {
  const context = { collections: { Cart: { findOne: jest.fn().mockName("findOne") } } };
  const cart = { _id: "cartId" };
  const promotion = { _id: "promotionId" };
  applyExplicitPromotion(context, cart, promotion);
  expect(applyPromotions).toHaveBeenCalledWith(context, cart, promotion);
});
