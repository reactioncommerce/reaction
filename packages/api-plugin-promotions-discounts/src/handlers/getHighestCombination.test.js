import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getHighestCombination from "./getHighestCombination.js";


test("should return the highest combination of promotions", async () => {
  const cart = {
    _id: "cartId",
    items: [
      {
        _id: "itemId",
        subtotal: {
          discount: 0
        }
      },
      {
        _id: "itemId2",
        subtotal: {
          discount: 0
        }
      }
    ]
  };

  const combinations = [
    [
      { _id: "promo1", discount: 10 },
      { _id: "promo2", discount: 2 }
    ],
    [
      { _id: "promo3", discount: 3 },
      { _id: "promo4", discount: 5 }
    ]
  ];

  mockContext.promotions = {
    enhancers: [],
    utils: {
      enhanceCart: jest.fn().mockImplementation((_, __, _cart) => _cart),
      actionHandler: jest.fn().mockImplementation((context, _cart, promo) => {
        _cart.items.forEach((item) => {
          item.subtotal.discount += promo.discount;
        });
        return { affected: true };
      })
    }
  };

  const result = await getHighestCombination(mockContext, cart, combinations);
  const highestPromotions = combinations[0];
  expect(result).toEqual(highestPromotions);
});
