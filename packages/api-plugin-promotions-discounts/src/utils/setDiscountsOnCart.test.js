import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import recalculateCartItemSubtotal from "./discountTypes/item/recalculateCartItemSubtotal.js";
import setDiscountsOnCart from "./setDiscountsOnCart.js";

jest.mock("./discountTypes/item/recalculateCartItemSubtotal.js", () => jest.fn());

test("should set discounts on cart", () => {
  const cart = {
    _id: "cart1",
    items: [
      {
        _id: "item1",
        price: {
          amount: 12
        },
        quantity: 5,
        subtotal: {
          amount: 60,
          currencyCode: "USD"
        }
      }
    ],
    discounts: [
      {
        discountCalculationType: "fixed",
        discountValue: 15
      }
    ]
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(15)
  };

  const expectedItemSubtotal = {
    amount: 60,
    currencyCode: "USD",
    discount: 15,
    undiscountedAmount: 60
  };

  recalculateCartItemSubtotal.mockImplementationOnce((context, item) => {
    item.subtotal = { ...expectedItemSubtotal };
  });

  setDiscountsOnCart(mockContext, cart);

  expect(mockContext.discountCalculationMethods.fixed).toHaveBeenCalledWith(15, 60);
  expect(recalculateCartItemSubtotal).toHaveBeenCalledTimes(1);
  expect(recalculateCartItemSubtotal).toHaveBeenCalledWith(mockContext, cart.items[0]);
  expect(cart.discount).toEqual(15);

  expect(cart.items[0].subtotal).toEqual(expectedItemSubtotal);
});
