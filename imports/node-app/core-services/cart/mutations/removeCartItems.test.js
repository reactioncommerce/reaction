import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeCartItems from "./removeCartItems.js";

const dbCart = {
  _id: "cartId",
  items: []
};

const cartItemIds = ["cartItemId1", "cartItemId2"];

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("removes multiple items from account cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const result = await removeCartItems(mockContext, { cartId: "cartId", cartItemIds });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    accountId: "FAKE_ACCOUNT_ID"
  });

  expect(result).toEqual({
    cart: {
      ...dbCart,
      items: dbCart.items.filter((item) => !cartItemIds.includes(item._id)),
      updatedAt: jasmine.any(Date)
    }
  });
});

test("removes multiple items from anonymous cart", async () => {
  const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;
  const result = await removeCartItems(mockContext, {
    cartId: "cartId",
    cartItemIds,
    token: "TOKEN"
  });
  mockContext.accountId = cachedAccountId;

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({
    cart: {
      ...dbCart,
      items: dbCart.items.filter((item) => !cartItemIds.includes(item._id)),
      updatedAt: jasmine.any(Date)
    }
  });
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
