import applyExplicitPromotion from "./applyExplicitPromotion.js";

jest.mock("../handlers/applyPromotions.js", () => jest.fn().mockName("applyPromotions"));

test("call applyPromotions function", async () => {
  const mockSaveCartMutation = jest.fn().mockName("saveCartMutation");
  const context = {
    collections: { Cart: { findOne: jest.fn().mockName("findOne") } },
    mutations: { saveCart: mockSaveCartMutation }
  };
  const cart = { _id: "cartId" };
  const promotion = { _id: "promotionId" };

  applyExplicitPromotion(context, cart, promotion);

  const expectedCart = {
    ...cart,
    appliedPromotions: [
      {
        ...promotion,
        newlyAdded: true
      }
    ]
  };
  expect(mockSaveCartMutation).toHaveBeenCalledWith(context, expectedCart);
});
