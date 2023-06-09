/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import validateInitialOrderData from "./validateInitialOrderData.js";

test("should throw if no shopId provided", async () => {
  const cleanedInput = { order: { cartId: "cart123" } };
  const errorExpected = new ReactionError("invalid-param", "ShopID not found in order data", { field: "ShopId", value: undefined });
  await expect(validateInitialOrderData(mockContext, cleanedInput)).rejects.toThrow(errorExpected);
});

test("should throw if no shop retrieved using shopId provided", async () => {
  mockContext.queries.shopById = jest.fn().mockReturnValueOnce(undefined);
  const cleanedInput = { order: { cartId: "cart123", shopId: "shop123" } };
  const errorExpected = new ReactionError("not-found", "Shop not found while trying to validate order data", { field: "ShopId", value: "shop123" });
  await expect(validateInitialOrderData(mockContext, cleanedInput)).rejects.toThrow(errorExpected);
});

test("should throw if no cart retrieved using cartId provided", async () => {
  mockContext.queries.shopById = jest.fn().mockReturnValueOnce({ shopId: "shop123" });
  mockContext.queries.getCartById = jest.fn().mockReturnValueOnce(undefined);
  const cleanedInput = { order: { cartId: "cart123", shopId: "shop123" } };
  const errorExpected = new ReactionError("not-found", "Cart not found while trying to validate order data", { field: "CartId", value: "cart123" });
  await expect(validateInitialOrderData(mockContext, cleanedInput)).rejects.toThrow(errorExpected);
});

test("should return shop and cart details", async () => {
  mockContext.queries.shopById = jest.fn().mockReturnValueOnce({ shopId: "shop123" });
  mockContext.queries.getCartById = jest.fn().mockReturnValueOnce({ cartId: "cart123" });
  mockContext.mutations.transformAndValidateCart = jest.fn();
  const cleanedInput = { order: { cartId: "cart123", shopId: "shop123" } };
  const resultExpected = { cart: { cartId: "cart123" }, shop: { shopId: "shop123" } };
  const result = await validateInitialOrderData(mockContext, cleanedInput);
  expect(result).toEqual(resultExpected);
});

test("should throw if no userId and No guest checkout", async () => {
  mockContext.userId = undefined;
  mockContext.queries.shopById = jest.fn().mockReturnValueOnce({ shopId: "shop123" });
  mockContext.queries.getCartById = jest.fn().mockReturnValueOnce({ cartId: "cart123" });
  const cleanedInput = { order: { cartId: "cart123", shopId: "shop123" } };
  const errorExpected = new ReactionError("access-denied", "Guest checkout not allowed");
  await expect(validateInitialOrderData(mockContext, cleanedInput)).rejects.toThrow(errorExpected);
});
