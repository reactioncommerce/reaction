import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory";
import reconcileCartsKeepAnonymousCart from "./reconcileCartsKeepAnonymousCart.js";

const { Cart } = mockContext.collections;
const accountId = "accountId";
const accountCart = { _id: "ACCOUNT_CART", accountId };
const anonymousCartSelector = { _id: "123" };
const items = [Factory.CartItem.makeOne()];

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("overwrites account cart items, deletes anonymous cart, and returns updated account cart", async () => {
  const result = await reconcileCartsKeepAnonymousCart({
    accountCart,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    context: mockContext
  });

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(result).toEqual({
    ...accountCart,
    items,
    updatedAt: jasmine.any(Date)
  });
});

test("throws if deleteOne fails", async () => {
  Cart.deleteOne.mockReturnValueOnce(Promise.resolve({ deletedCount: 0 }));

  const promise = reconcileCartsKeepAnonymousCart({
    accountCart,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    context: mockContext
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
