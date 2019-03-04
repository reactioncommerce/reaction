import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import updateCartItemsQuantity from "./updateCartItemsQuantity";


const cartItemId1 = Factory.CartItem.makeOne({
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
});
const cartItemId2 = Factory.CartItem.makeOne({
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
});

const dbCart = {
  _id: "cartId",
  items: [
    cartItemId1, cartItemId2
  ]
};

const updatedCartItemId1 = Factory.CartItem.makeOne({
  subtotal: {
    amount: 2000,
    currencyCode: "mockCurrencyCode"
  },
  ...cartItemId1
});
const updatedCartItemId2 = Factory.CartItem.makeOne({
  subtotal: {
    amount: 1000,
    currencyCode: "mockCurrencyCode"
  },
  ...cartItemId2
});

const updatedDbCart = {
  _id: "cartId",
  items: [
    updatedCartItemId1, updatedCartItemId2
  ]
};

const updatedDbCartAfterRemoval = {
  _id: "cartId",
  items: [
    updatedCartItemId2
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("updates the quantity of multiple items in account cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(updatedDbCart));

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

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId"
  }, {
    $set: {
      items: [
        {
          ...dbCart.items[0],
          quantity: 1,
          subtotal: {
            amount: dbCart.items[0].price.amount,
            currencyCode: dbCart.items[0].subtotal.currencyCode
          }
        },
        {
          ...dbCart.items[1],
          quantity: 2,
          subtotal: {
            amount: dbCart.items[1].price.amount * 2,
            currencyCode: dbCart.items[1].subtotal.currencyCode
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          ...updatedDbCart.items[0],
          quantity: 5,
          subtotal: {
            amount: updatedDbCart.items[0].price.amount * 5,
            currencyCode: updatedDbCart.items[0].subtotal.currencyCode
          }
        },
        {
          ...updatedDbCart.items[1],
          quantity: 5,
          subtotal: {
            amount: updatedDbCart.items[1].price.amount * 5,
            currencyCode: updatedDbCart.items[1].subtotal.currencyCode
          }
        }
      ]
    }
  });
});

test("updates the quantity of multiple items in anonymous cart", async () => {
  const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(updatedDbCart));

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

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId"
  }, {
    $set: {
      items: [
        {
          ...dbCart.items[0],
          quantity: 1,
          subtotal: {
            amount: dbCart.items[0].price.amount,
            currencyCode: dbCart.items[0].subtotal.currencyCode
          }
        },
        {
          ...dbCart.items[1],
          quantity: 2,
          subtotal: {
            amount: dbCart.items[1].price.amount * 2,
            currencyCode: dbCart.items[1].subtotal.currencyCode
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          ...updatedDbCart.items[0],
          quantity: 5,
          subtotal: {
            amount: updatedDbCart.items[0].price.amount * 5,
            currencyCode: updatedDbCart.items[0].subtotal.currencyCode
          }
        },
        {
          ...updatedDbCart.items[1],
          quantity: 5,
          subtotal: {
            amount: updatedDbCart.items[1].price.amount * 5,
            currencyCode: updatedDbCart.items[1].subtotal.currencyCode
          }
        }
      ]
    }
  });
});

test("throws when no account and no token passed", async () => {
  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;

  await expect(updateCartItemsQuantity(mockContext, {
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
  })).rejects.toThrowErrorMatchingSnapshot();

  mockContext.accountId = cachedAccountId;
});

test("removes an item if quantity is 0", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(updatedDbCartAfterRemoval));

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

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId"
  }, {
    $set: {
      items: [
        {
          ...dbCart.items[1],
          quantity: 2,
          subtotal: {
            amount: dbCart.items[1].price.amount * 2,
            currencyCode: dbCart.items[1].subtotal.currencyCode
          }
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [
        {
          ...updatedDbCartAfterRemoval.items[0],
          quantity: 5,
          subtotal: {
            amount: updatedDbCartAfterRemoval.items[0].price.amount * 5,
            currencyCode: updatedDbCartAfterRemoval.items[0].subtotal.currencyCode
          }
        }
      ]
    }
  });
});
