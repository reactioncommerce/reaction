import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import calculateDiscountedItemPrice from "./calculateDiscountedItemPrice.js";

test("should calculate discounted item price", () => {
  const price = 10;
  const quantity = 5;
  const discounts = [
    {
      discountCalculationType: "fixed",
      discountValue: 15
    }
  ];

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(15)
  };

  const discountedPrice = calculateDiscountedItemPrice(mockContext, { price, quantity, discounts });

  expect(mockContext.discountCalculationMethods.fixed).toHaveBeenCalledWith(15, 50);
  expect(discountedPrice).toEqual(35);
});
