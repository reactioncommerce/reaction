import mockContext from "/imports/test-utils/helpers/mockContext";
import reconcileCartsKeepAnonymousCart from "./reconcileCartsKeepAnonymousCart";

const { Cart } = mockContext.collections;
const accountId = "accountId";
const accountCart = { _id: "ACCOUNT_CART", accountId };
const accountCartSelector = { accountId };
const anonymousCartSelector = { _id: "123" };
const items = [
  {
    _id: "CartItemID",
    addedAt: new Date("2018-01-01T00:00:00.000"),
    createdAt: new Date("2018-01-01T00:00:00.000"),
    productId: "productId",
    quantity: 1,
    shopId: "shopId",
    title: "TITLE",
    updatedAt: new Date("2018-01-01T00:00:00.000"),
    variantId: "variantId",
    priceWhenAdded: {
      amount: 9.99,
      currencyCode: "USD"
    }
  }
];

test("overwrites account cart items, deletes anonymous cart, and returns updated account cart", async () => {
  const result = await reconcileCartsKeepAnonymousCart({
    accountCart,
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    Cart
  });

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(Cart.updateOne).toHaveBeenCalledWith(accountCartSelector, {
    $set: {
      items,
      updatedAt: jasmine.any(Date)
    }
  });

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
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    Cart
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if updateOne fails", async () => {
  Cart.updateOne.mockReturnValueOnce(Promise.resolve({ modifiedCount: 0 }));

  const promise = reconcileCartsKeepAnonymousCart({
    accountCart,
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    Cart
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
