import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import applyPromotions from "../handlers/applyPromotions.js";
import { checkForChangedCart } from "./checkCartForPromotionChange.js";

const existingCart = {
  appliedPromotions: [{
    updatedAt: new Date(),
    _id: "promotion1"
  }]
};

jest.mock("../handlers/applyPromotions");

const mockSaveCart = jest.fn();
mockContext.mutations = {
  saveCart: mockSaveCart
};


mockContext.collections.Carts = mockCollection("Carts");
mockContext.collections.Carts.findOne.mockReturnValue(Promise.resolve(existingCart));

test("should trigger a saveCart mutation when promotions are completely different", async () => {
  const updatedCart = {
    appliedPromotions: [{
      updatedAt: new Date(),
      _id: "promotion2"
    }]
  };
  applyPromotions.mockImplementation(() => updatedCart);
  const { updated, reason } = await checkForChangedCart(mockContext, mockContext.collections.Carts, "cartId");
  expect(updated).toBeTruthy();
  expect(reason).toEqual("new or missing promotion");
});

test("should trigger a saveCart mutation when promotions are slightly different", async () => {
  const updatedCart = {
    appliedPromotions: [{
      updatedAt: new Date(),
      _id: "promotion1",
      something: "else"
    }]
  };
  applyPromotions.mockImplementation(() => updatedCart);
  const { updated, reason } = await checkForChangedCart(mockContext, mockContext.collections.Carts, "cartId");
  expect(updated).toBeTruthy();
  expect(reason).toEqual("promotions not equal");
});

test("should not trigger a saveCart mutation when the cart has not changed", async () => {
  applyPromotions.mockImplementation(() => existingCart);
  const { updated, reason } = await checkForChangedCart(mockContext, mockContext.collections.Carts, "cartId");
  expect(updated).toBeFalsy();
  expect(reason).toBeNull();
});
