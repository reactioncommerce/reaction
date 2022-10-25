/* eslint-disable require-jsdoc */
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getDiscounts from "./getDiscounts.js";

test("should return empmty fields if no cart details are passed", async () => {
  const result = await getDiscounts(mockContext);
  expect(result).toEqual({
    discounts: [],
    discountTotal: 0
  });
});

test("should return empmty fields if no discount functions defined", async () => {
  mockContext.queries.getDiscountsTotalForCart = jest.fn().mockReturnValueOnce(undefined);

  const cartInput = { cartId: "cart123" };
  const result = await getDiscounts(mockContext, cartInput);
  expect(result).toEqual({
    discounts: [],
    discountTotal: 0
  });
});

test("should return discount details if there are discount functions defined", async () => {
  mockContext.queries.getDiscountsTotalForCart = jest.fn().mockName("getDiscountsTotalForCart").mockReturnValueOnce({
    discounts: [{
      discountId: "discountId", amount: 10
    }],
    total: 10
  });

  const cartInput = { cartId: "cart123" };
  const result = await getDiscounts(mockContext, cartInput);

  expect(result).toEqual({
    discounts: [{
      discountId: "discountId", amount: 10
    }],
    discountTotal: 10
  });
});
