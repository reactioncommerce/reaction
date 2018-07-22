import mockContext from "/imports/test-utils/helpers/mockContext";
import updateCartItemsQuantity from "./updateCartItemsQuantity";

const dbCart = {
  _id: "cartId",
  items: []
};

test("updates the quantity of multiple items in account cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  mockContext.collections.Cart.updateOne.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1
  }));

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
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  }, {
    $set: {
      "items.$[cartItemId1].quantity": 1,
      "items.$[cartItemId2].quantity": 2
    }
  }, {
    arrayFilters: [
      { "cartItemId1._id": "cartItemId1" },
      { "cartItemId2._id": "cartItemId2" }
    ]
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  });

  expect(result).toEqual({
    cart: dbCart
  });
});

test("updates the quantity of multiple items in anonymous cart", async () => {
  const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  mockContext.collections.Cart.updateOne.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1
  }));

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
    _id: "cartId",
    anonymousAccessToken: hashedToken
  }, {
    $set: {
      "items.$[cartItemId1].quantity": 1,
      "items.$[cartItemId2].quantity": 2
    }
  }, {
    arrayFilters: [
      { "cartItemId1._id": "cartItemId1" },
      { "cartItemId2._id": "cartItemId2" }
    ]
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({
    cart: dbCart
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

  mockContext.collections.Cart.updateOne.mockReturnValue(Promise.resolve({
    modifiedCount: 1
  }));

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
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  }, {
    $set: {
      "items.$[cartItemId2].quantity": 2
    }
  }, {
    arrayFilters: [
      { "cartItemId2._id": "cartItemId2" }
    ]
  });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  }, {
    $pull: {
      items: {
        $or: [
          { _id: "cartItemId1" }
        ]
      }
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  });

  expect(result).toEqual({
    cart: dbCart
  });
});
