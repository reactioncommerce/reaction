import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { withFilter } from "graphql-subscriptions";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import cartUpdated, { filter } from "./cartUpdated.js";

jest.mock("@reactioncommerce/api-utils/hashToken.js", () => jest.fn().mockName("hashToken"));
jest.mock("graphql-subscriptions", () => ({ withFilter: jest.fn() }));

mockContext.pubSub = {
  asyncIterator: jest.fn().mockName("pubSub.asyncIterator")
};

beforeEach(() => jest.resetAllMocks());

test("filter returns false when payload does't contain cart", () => {
  const payload = {};
  const variables = { input: {} };
  expect(filter(payload, variables)).toBe(false);
});

test("filter returns false when the input does't contain cardId", () => {
  const payload = { cartUpdated: { _id: "cartId" } };
  const variables = { input: { accountId: "accountId" } };
  expect(filter(payload, variables)).toBe(false);
});

test("filter return true when provided correct cartId and accountId input", () => {
  const payload = { cartUpdated: { _id: "cartId", accountId: "accountId" } };
  const variables = { input: { cartId: "cartId", accountId: "accountId" } };
  expect(filter(payload, variables)).toBe(true);
});

test("filter return false when provided incorrect cartId and accountId input", () => {
  const payload = { cartUpdated: { _id: "cartId", accountId: "accountId" } };
  const variables = { input: { cartId: "cartId", accountId: "incorrectAccountId" } };
  expect(filter(payload, variables)).toBe(false);
});

test("filter return true when provided correct cartId and cartToken input", () => {
  hashToken.mockReturnValueOnce("hashToken");
  const payload = { cartUpdated: { _id: "cartId", anonymousAccessToken: "hashToken" } };
  const variables = { input: { cartId: "cartId", cartToken: "token" } };
  expect(filter(payload, variables)).toBe(true);
});

test("filter return false when provided incorrect cartId and cartToken input", () => {
  hashToken.mockReturnValueOnce("incorrectHashToken");
  const payload = { cartUpdated: { _id: "cartId", anonymousAccessToken: "hashToken" } };
  const variables = { input: { cartId: "cartId", cartToken: "token" } };
  expect(filter(payload, variables)).toBe(false);
});

test("cartUpdated throws invalid-params error when input is provided accountId but context is'nt contain userId", async () => {
  const context = { ...mockContext };
  const args = { input: { cartId: "cartId", accountId: "accountId" } };
  context.userId = undefined;
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(null));

  try {
    await cartUpdated.subscribe(null, args, context);
  } catch (error) {
    expect(error.error).toEqual("invalid-params");
  }
});

test("cartUpdated find cart with accountId when input is provided accountId", async () => {
  const mockFn = jest.fn();
  // eslint-disable-next-line no-unused-vars
  withFilter.mockImplementation((subscribe, _filterFn) => {
    subscribe();
    return mockFn;
  });

  const context = { ...mockContext };
  const args = { input: { cartId: "cartId", accountId: "accountId" } };
  context.userId = "userId";
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve({ _id: "accountId", userId: "userId" }));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({ _id: "cartId", accountId: "accountId" }));

  await cartUpdated.subscribe(null, args, context);
  expect(context.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "cartId", accountId: "accountId" });
});

test("cartUpdated find cart with anonymousAccessToken when input is provided cartToken", async () => {
  const mockFn = jest.fn();
  // eslint-disable-next-line no-unused-vars
  withFilter.mockImplementation((subscribe, _filterFn) => {
    subscribe();
    return mockFn;
  });
  hashToken.mockReturnValueOnce("hashToken");

  const context = { ...mockContext };
  const args = { input: { cartId: "cartId", cartToken: "token" } };
  context.userId = "userId";
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({ _id: "cartId", anonymousAccessToken: "hashToken" }));

  await cartUpdated.subscribe(null, args, context);
  expect(context.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "cartId", anonymousAccessToken: "hashToken" });
});

test("cartUpdated should throws not-found error when cart is not found", async () => {
  const mockFn = jest.fn();
  // eslint-disable-next-line no-unused-vars
  withFilter.mockImplementation((subscribe, _filterFn) => {
    subscribe();
    return mockFn;
  });

  const context = { ...mockContext };
  const args = { input: { cartId: "cartId", accountId: "accountId" } };
  context.userId = "userId";
  context.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve({ _id: "accountId", userId: "userId" }));
  context.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(null));

  try {
    await cartUpdated.subscribe(null, args, context);
  } catch (error) {
    expect(error.error).toEqual("not-found");
  }
});
