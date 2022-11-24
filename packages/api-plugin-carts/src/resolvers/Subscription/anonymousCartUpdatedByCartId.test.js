import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { withFilter } from "graphql-subscriptions";
import anonymousCartUpdatedByCartId, { filter } from "./anonymousCartUpdatedByCartId.js";

jest.mock("graphql-subscriptions", () => ({
  withFilter: jest.fn()
}));

mockContext.pubSub = {
  asyncIterator: jest.fn().mockName("pubSub.asyncIterator")
};

beforeEach(() => jest.resetAllMocks());

test("filter returns false when payload doesn't contain cart", () => {
  const payload = {};
  const variables = {};
  expect(filter(payload, variables)).toBe(false);
});

test("filter returns false when variables doesn't contain cardId", () => {
  const payload = { anonymousCartUpdatedByCartId: { _id: "cartId", anonymousAccessToken: "token" } };
  const variables = { };
  expect(filter(payload, variables)).toBe(false);
});

test("filter return true when input cartId and payload cart _id are equal", () => {
  const payload = { anonymousCartUpdatedByCartId: { _id: "cartId", anonymousAccessToken: "token" } };
  const variables = { cartId: "cartId" };
  expect(filter(payload, variables)).toBe(true);
});

test("anonymousCartUpdatedByCartId throws validate error when input doesn't contain cartId", async () => {
  const context = { ...mockContext };
  const args = {};
  try {
    await anonymousCartUpdatedByCartId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("You must provide a cartId");
  }
});

test("anonymousCartUpdatedByCartId throws validate error when input doesn't contain cartToken", async () => {
  const context = { ...mockContext };
  const args = { cartId: "cartId" };
  try {
    await anonymousCartUpdatedByCartId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("You must provide a cartToken");
  }
});

test("accountCartUpdate throws Cart not found error when cart doesn't found", async () => {
  const context = { ...mockContext };
  const args = { cartId: "cartId", cartToken: "token" };
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(null));
  context.userId = "userId";
  try {
    await anonymousCartUpdatedByCartId.subscribe(null, args, context);
  } catch (error) {
    expect(error.message).toEqual("Cart not found");
  }
});

test("anonymousCartUpdatedByCartId init correct subscription object", async () => {
  const mockFn = jest.fn();
  // eslint-disable-next-line no-unused-vars
  withFilter.mockImplementation((subscribe, _filterFn) => {
    subscribe();
    return mockFn;
  });
  const context = { ...mockContext };
  const args = { cartId: "cartId", cartToken: "token" };
  const account = { _id: "accountId" };
  const cart = { _id: "cartId" };
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(account));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(cart));
  context.userId = "userId";
  await anonymousCartUpdatedByCartId.subscribe(null, args, context);

  expect(context.pubSub.asyncIterator).toHaveBeenCalledWith(["CART_UPDATED"]);
  expect(withFilter).toHaveBeenCalledWith(expect.any(Function), filter);
  expect(mockFn).toHaveBeenCalledWith(null, args, context);
});
