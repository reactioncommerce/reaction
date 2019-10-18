import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateCartItemsQuantity from "./updateCartItemsQuantity.js";

jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "cartId",
  items: [
    {
      _id: "cartItemId1",
      quantity: 5,
      price: {
        amount: 400,
        currencyCode: "mockCurrencyCode"
      },
      subtotal: {
        amount: 2000,
        currencyCode: "mockCurrencyCode"
      }
    },
    {
      _id: "cartItemId2",
      quantity: 5,
      price: {
        amount: 200,
        currencyCode: "mockCurrencyCode"
      },
      subtotal: {
        amount: 1000,
        currencyCode: "mockCurrencyCode"
      }
    }
  ]
})));

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("updates the quantity of multiple items in account cart", async () => {
  const result = await updateCartItemsQuantity(mockContext, {
    cartId: "cartId",
    items: [
      {
        cartItemId: "cartItemId1",
        quantity: 1
      },
      {
        cartItemId: "cartItemId2",
        quantity: 2
      }
    ]
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          _id: "cartItemId1",
          quantity: 1,
          price: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          },
          subtotal: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          }
        },
        {
          _id: "cartItemId2",
          quantity: 2,
          price: {
            amount: 200,
            currencyCode: "mockCurrencyCode"
          },
          subtotal: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("updates the quantity of multiple items in anonymous cart", async () => {
  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;
  const result = await updateCartItemsQuantity(mockContext, {
    cartId: "cartId",
    items: [
      {
        cartItemId: "cartItemId1",
        quantity: 1
      },
      {
        cartItemId: "cartItemId2",
        quantity: 2
      }
    ],
    token: "TOKEN"
  });
  mockContext.accountId = cachedAccountId;

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          _id: "cartItemId1",
          quantity: 1,
          price: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          },
          subtotal: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          }
        },
        {
          _id: "cartItemId2",
          quantity: 2,
          price: {
            amount: 200,
            currencyCode: "mockCurrencyCode"
          },
          subtotal: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("removes an item if quantity is 0", async () => {
  const result = await updateCartItemsQuantity(mockContext, {
    cartId: "cartId",
    items: [
      {
        cartItemId: "cartItemId1",
        quantity: 0
      },
      {
        cartItemId: "cartItemId2",
        quantity: 2
      }
    ]
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          _id: "cartItemId2",
          quantity: 2,
          price: {
            amount: 200,
            currencyCode: "mockCurrencyCode"
          },
          subtotal: {
            amount: 400,
            currencyCode: "mockCurrencyCode"
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });
});
