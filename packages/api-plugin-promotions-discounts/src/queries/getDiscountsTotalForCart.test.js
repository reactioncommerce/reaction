import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getDiscountsTotalForCart from "./getDiscountsTotalForCart.js";

test("should return correct cart total discount when cart has no discounts", async () => {
  const cart = {
    _id: "cart1",
    discount: 4,
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
        },
        discounts: []
      },
      {
        _id: "item2",
        price: {
          amount: 12
        },
        quantity: 1,
        subtotal: {
          amount: 10,
          currencyCode: "USD",
          discount: 2,
          undiscountedAmount: 12
        },
        discounts: []
      }
    ],
    shipping: []
  };

  const results = await getDiscountsTotalForCart(mockContext, cart);

  expect(results.total).toEqual(4);
});
