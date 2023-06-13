import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import _ from "lodash";
import applyPromotions from "../handlers/applyPromotions.js";
import { hasChanged } from "./checkCartForPromotionChange.js";

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


mockContext.collections.Cart = mockCollection("Carts");
mockContext.collections.Cart.findOne.mockReturnValue(Promise.resolve(existingCart));

test("should trigger a saveCart mutation when promotions are completely different", async () => {
  const updatedCart = {
    appliedPromotions: [{
      updatedAt: new Date(),
      _id: "promotion2"
    }]
  };
  applyPromotions.mockImplementation(() => updatedCart);
  const { updated } = await hasChanged(mockContext, mockContext.collections.Cart, "cartId");
  expect(updated).toBeTruthy();
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
  const { updated } = await hasChanged(mockContext, mockContext.collections.Cart, "cartId");
  expect(updated).toBeTruthy();
});

test("should not trigger a saveCart mutation when the cart has not changed", async () => {
  applyPromotions.mockImplementation(() => existingCart);
  const { updated } = await hasChanged(mockContext, mockContext.collections.Cart, "cartId");
  expect(updated).toBeFalsy();
});

test("should not trigger a saveCart mutation when only the updatedAt date changed", async () => {
  const updatedAtCart = _.cloneDeep(existingCart);
  updatedAtCart.appliedPromotions[0].updatedAt = new Date("1970-January-01");
  applyPromotions.mockImplementation(() => existingCart);
  const { updated } = await hasChanged(mockContext, mockContext.collections.Cart, "cartId");
  expect(updated).toBeFalsy();
});
