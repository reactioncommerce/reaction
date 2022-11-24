import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { withFilter } from "graphql-subscriptions";
import accountCartUpdatedByAccountId, { filter } from "./accountCartUpdatedByAccountId.js";

jest.mock("graphql-subscriptions", () => ({
  withFilter: jest.fn()
}));

mockContext.pubSub = {
  asyncIterator: jest.fn().mockName("pubSub.asyncIterator")
};

beforeEach(() => jest.resetAllMocks());

test("filter returns false when payload does't contain cart", () => {
  const payload = {};
  const variables = {};
  expect(filter(payload, variables)).toBe(false);
});

test("filter returns false when variables does't contain cardId", () => {
  const payload = { accountCartUpdatedByAccountId: { _id: "cartId" } };
  const variables = { accountId: "accountId", shopId: "shopId" };
  expect(filter(payload, variables)).toBe(false);
});

test("filter return true when input cartId and payload cart _id are equal", () => {
  const payload = { accountCartUpdatedByAccountId: { _id: "cartId" } };
  const variables = { input: { cartId: "cartId" } };
  expect(filter(payload, variables)).toBe(true);
});

test("accountCartUpdatedByAccountId throws access denied error when context is'nt contain userId", async () => {
  const context = { ...mockContext };
  const args = {};
  context.userId = undefined;
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({}));

  try {
    await accountCartUpdatedByAccountId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("Access denied");
  }
});

test("accountCartUpdatedByAccountId throws Account mismatch when user provided invalid accountId", async () => {
  const context = { ...mockContext };
  const args = { accountId: "accountId" };
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(null));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({}));
  context.userId = "userId";
  try {
    await accountCartUpdatedByAccountId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("Account id does not match user id");
  }
});

test("accountCartUpdatedByAccountId throws validation error when input isn't contain accountId", async () => {
  const context = { ...mockContext };
  const args = {};
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve({}));
  context.userId = "userId";
  try {
    await accountCartUpdatedByAccountId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("You must provide an accountId");
  }
});

test("accountCartUpdatedByAccountId throws Cart not found error when cart is not found", async () => {
  const context = { ...mockContext };
  const args = { accountId: "accountId", shopId: "shopId" };
  const account = { _id: "accountId" };
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(account));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(null));
  context.userId = "userId";
  try {
    await accountCartUpdatedByAccountId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("Cart not found");
  }
});

test("accountCartUpdatedByAccountId init correct subscription object", async () => {
  const mockFn = jest.fn();
  // eslint-disable-next-line no-unused-vars
  withFilter.mockImplementation((subscribe, _filterFn) => {
    subscribe();
    return mockFn;
  });
  const context = { ...mockContext };
  const args = { accountId: "accountId" };
  const account = { _id: "accountId" };
  const cart = { _id: "cartId" };
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(account));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));
  context.userId = "userId";
  await accountCartUpdatedByAccountId.subscribe(null, args, context);

  expect(context.pubSub.asyncIterator).toHaveBeenCalledWith(["CART_UPDATED"]);
  expect(withFilter).toHaveBeenCalledWith(expect.any(Function), filter);
  expect(mockFn).toHaveBeenCalledWith(null, args, context);
});
