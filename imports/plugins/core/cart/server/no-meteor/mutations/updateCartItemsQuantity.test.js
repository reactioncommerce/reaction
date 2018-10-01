import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import updateCartItemsQuantity from "./updateCartItemsQuantity";

const dbCart = {
  _id: "cartId",
  items: [
    Factory.CartItem.makeOne({
      _id: "cartItemId1",
      quantity: 5
    }),
    Factory.CartItem.makeOne({
      _id: "cartItemId2",
      quantity: 5
    })
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("updates the quantity of multiple items in account cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

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
          quantity: 1
        },
        {
          ...dbCart.items[1],
          quantity: 2
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
          ...dbCart.items[0],
          quantity: 1
        },
        {
          ...dbCart.items[1],
          quantity: 2
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("updates the quantity of multiple items in anonymous cart", async () => {
  const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

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
          quantity: 1
        },
        {
          ...dbCart.items[1],
          quantity: 2
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
          ...dbCart.items[0],
          quantity: 1
        },
        {
          ...dbCart.items[1],
          quantity: 2
        }
      ],
      updatedAt: jasmine.any(Date)
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
          quantity: 2
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
          ...dbCart.items[1],
          quantity: 2
        }
      ],
      updatedAt: jasmine.any(Date)
    }
  });
});
