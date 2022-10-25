/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import getReferenceId from "./getReferenceId.js";

test("should return referenceId from Cart or Random if there are NO functions defined", async () => {
  mockContext.getFunctionsOfType = jest.fn().mockReturnValueOnce([]);

  const orderInput = { orderId: "order123" };

  const cartInput1 = { cartId: "cart123", referenceId: "referenceId123" };
  const result1 = await getReferenceId(mockContext, cartInput1, orderInput);
  expect(result1).toEqual("referenceId123");

  const cartInput2 = { cartId: "cart123" };
  const result2 = await getReferenceId(mockContext, cartInput2, orderInput);
  expect(result2).toEqual(jasmine.any(String));
});

test("should return referenceId from function if there are functions defined", async () => {
  mockContext.getFunctionsOfType = jest.fn().mockReturnValueOnce([
    jest.fn().mockName("createOrderReferenceId").mockReturnValueOnce(Promise.resolve("referenceId321"))
  ]);

  const orderInput = { orderId: "order123" };
  const cartInput = { cartId: "cart123", referenceId: "referenceId123" };

  const result = await getReferenceId(mockContext, cartInput, orderInput);
  expect(result).toEqual("referenceId321");
});

test("should throw error if returned referenceId from function is not string", async () => {
  mockContext.getFunctionsOfType = jest.fn().mockReturnValueOnce([
    jest.fn().mockName("createOrderReferenceId").mockReturnValueOnce(Promise.resolve(1234))
  ]);

  const orderInput = { orderId: "order123" };
  const cartInput = { cartId: "cart123", referenceId: "referenceId123" };

  const errorExpected = new ReactionError("invalid-parameter", "Non-string value for Reference Id");
  await expect(getReferenceId(mockContext, cartInput, orderInput)).rejects.toThrow(errorExpected);
});
