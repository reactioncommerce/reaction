import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getCartDiscountAmount from "./getCartDiscountAmount.js";

test("should return correct discount amount", () => {
  const cart = {
    _id: "cart1",
    items: [
      {
        _id: "item1",
        price: {
          amount: 12
        },
        quantity: 1,
        subtotal: {
          amount: 10,
          currencyCode: "USD",
          discount: 2,
          undiscountedAmount: 12
        }
      }
    ],
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    }
  };

  const discount = {
    discountCalculationType: "fixed",
    discountValue: 10
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(10)
  };

  const discountAmount = getCartDiscountAmount(mockContext, cart, discount);
  expect(discountAmount).toEqual(10);
});
