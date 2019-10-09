import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import reconcileCarts from "./reconcileCarts.js";

jest.mock("./convertAnonymousCartToNewAccountCart", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "convertAnonymousCartToNewAccountCart"
})));

jest.mock("./reconcileCartsKeepAccountCart", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "reconcileCartsKeepAccountCart"
})));

jest.mock("./reconcileCartsKeepAnonymousCart", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "reconcileCartsKeepAnonymousCart"
})));

jest.mock("./reconcileCartsMerge", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "reconcileCartsMerge"
})));

const accountId = "accountId";
const anonymousCartId = "anonymousCartId";
const anonymousCartToken = "anonymousCartToken";
const shopId = "shopId";

const mockCarts = [
  { _id: anonymousCartId },
  { _id: "ACCOUNT_CART", accountId }
];

test("when mode is keepAccountCart, returns the result of reconcileCartsKeepAccountCart", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve(mockCarts));

  const result = await reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    mode: "keepAccountCart",
    shopId
  });

  expect(result).toEqual({ cart: { _id: "reconcileCartsKeepAccountCart" } });
});

test("when mode is keepAnonymousCart, returns the result of reconcileCartsKeepAnonymousCart", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve(mockCarts));

  const result = await reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    mode: "keepAnonymousCart",
    shopId
  });

  expect(result).toEqual({ cart: { _id: "reconcileCartsKeepAnonymousCart" } });
});

test("when mode is merge, returns the result of reconcileCartsMerge", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve(mockCarts));

  const result = await reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    mode: "merge",
    shopId
  });

  expect(result).toEqual({ cart: { _id: "reconcileCartsMerge" } });
});

test("when mode is undefined, returns the result of reconcileCartsMerge", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve(mockCarts));

  const result = await reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    shopId
  });

  expect(result).toEqual({ cart: { _id: "reconcileCartsMerge" } });
});

test("when there is no account cart yet, returns the result of convertAnonymousCartToNewAccountCart", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve([mockCarts[0]]));

  const result = await reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    mode: "keepAccountCart",
    shopId
  });

  expect(result).toEqual({ cart: { _id: "convertAnonymousCartToNewAccountCart" } });
});


test("when not authenticated, throw access denied", async () => {
  mockContext.accountId = null;
  mockContext.user = null;

  const promise = reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("when missing anonymousCartId, throws", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };

  const promise = reconcileCarts(mockContext, {
    anonymousCartToken,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("when missing anonymousCartToken, throws", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };

  const promise = reconcileCarts(mockContext, {
    anonymousCartId,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("when no matching anonymous cart is found, throws", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve([mockCarts[1]]));

  const promise = reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("when unknown mode is passed, throws", async () => {
  mockContext.accountId = accountId;
  mockContext.user = { accountId, roles: ["guest"] };
  mockContext.collections.Cart.toArray.mockReturnValueOnce(Promise.resolve(mockCarts));

  const promise = reconcileCarts(mockContext, {
    anonymousCartId,
    anonymousCartToken,
    mode: "foo",
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
