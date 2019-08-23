import mockContext from "/imports/test-utils/helpers/mockContext";
import removeCartItems from "./removeCartItems";

const dbCart = {
  _id: "cartId",
  items: []
};

const cartItemIds = ["cartItemId1", "cartItemId2"];

beforeEach(() => {
  jest.clearAllMocks();
});

test("removes multiple items from account cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const result = await removeCartItems(mockContext, { cartId: "cartId", cartItemIds });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId"
  }, {
    $pull: {
      items: {
        _id: {
          $in: cartItemIds
        }
      }
    },
    $set: {
      updatedAt: jasmine.any(Date)
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId"
  });

  expect(result).toEqual({ cart: dbCart });
});

test("removes multiple items from anonymous cart", async () => {
  const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;
  const result = await removeCartItems(mockContext, {
    cartId: "cartId",
    cartItemIds,
    token: "TOKEN"
  });
  mockContext.accountId = cachedAccountId;

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId"
  }, {
    $pull: {
      items: {
        _id: {
          $in: cartItemIds
        }
      }
    },
    $set: {
      updatedAt: jasmine.any(Date)
    }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({ cart: dbCart });
});

test("throws when no account and no token passed", async () => {
  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;

  await expect(removeCartItems(mockContext, {
    cartId: "cartId",
    cartItemIds
  })).rejects.toThrowErrorMatchingSnapshot();

  mockContext.accountId = cachedAccountId;
});
