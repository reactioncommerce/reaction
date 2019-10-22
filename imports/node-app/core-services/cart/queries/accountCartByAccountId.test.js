import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import accountCartByAccountId from "./accountCartByAccountId.js";

const shopId = "shopId";

test("for logged in account, expect to return a Promise that resolves to a cart", async () => {
  const cart = { _id: "cart" };
  const { accountId } = mockContext;
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));

  const result = await accountCartByAccountId(mockContext, { accountId, shopId });
  expect(result).toEqual(cart);
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ accountId, shopId });
});

test("for other account, allows if admin", async () => {
  const cart = { _id: "cart" };
  const accountId = "123";
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));

  const result = await accountCartByAccountId(mockContext, { accountId, shopId });
  expect(result).toEqual(cart);
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ accountId, shopId });
});

test("for other account, throws access denied if non-admin", async () => {
  const cart = { _id: "cart" };
  const accountId = "123";
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));

  expect(accountCartByAccountId(mockContext, { accountId, shopId })).rejects.toMatchSnapshot();
});
