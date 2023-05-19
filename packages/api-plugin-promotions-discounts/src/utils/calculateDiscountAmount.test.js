import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import calculateDiscountAmount from "./calculateDiscountAmount.js";

test("should return the correct discount amount", () => {
  const amount = 100;
  const parameters = {
    discountCalculationType: "fixed",
    discountValue: 10
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(10)
  };

  const discountAmount = calculateDiscountAmount(mockContext, amount, parameters);

  expect(discountAmount).toEqual(10);
});
