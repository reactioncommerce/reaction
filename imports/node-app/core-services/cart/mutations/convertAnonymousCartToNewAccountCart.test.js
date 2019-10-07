import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory";
import convertAnonymousCartToNewAccountCart from "./convertAnonymousCartToNewAccountCart.js";

const { Cart } = mockContext.collections;
const currencyCode = "GBP";
const accountId = "accountId";
const anonymousCartSelector = { _id: "123" };
const shopId = "shopId";
const items = [Factory.CartItem.makeOne()];

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("inserts a cart with the existing cart's items and returns it", async () => {
  mockContext.accountId = accountId;

  const result = await convertAnonymousCartToNewAccountCart(mockContext, {
    anonymousCart: {
      currencyCode,
      items,
      shopId
    },
    anonymousCartSelector
  });

  const newCart = {
    _id: jasmine.any(String),
    accountId,
    anonymousAccessToken: null,
    currencyCode,
    createdAt: jasmine.any(Date),
    items,
    shopId,
    updatedAt: jasmine.any(Date),
    workflow: {
      status: "new"
    }
  };

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(result).toEqual(newCart);
});

test("throws if deleteOne fails", async () => {
  Cart.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  Cart.deleteOne.mockReturnValueOnce(Promise.resolve({ deletedCount: 0 }));

  mockContext.accountId = accountId;

  const promise = convertAnonymousCartToNewAccountCart(mockContext, {
    anonymousCart: {
      currencyCode,
      items,
      shopId
    },
    anonymousCartSelector
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
