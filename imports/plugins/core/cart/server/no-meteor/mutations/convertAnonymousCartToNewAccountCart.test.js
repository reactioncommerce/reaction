import mockContext from "/imports/test-utils/helpers/mockContext";
import convertAnonymousCartToNewAccountCart from "./convertAnonymousCartToNewAccountCart";

const { Cart } = mockContext.collections;
const currencyCode = "GBP";
const accountId = "accountId";
const anonymousCartSelector = { _id: "123" };
const shopId = "shopId";
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
    isTaxable: false,
    priceWhenAdded: {
      amount: 9.99,
      currencyCode: "USD"
    }
  }
];

test("inserts a cart with the existing cart's items and returns it", async () => {
  Cart.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));

  const result = await convertAnonymousCartToNewAccountCart({
    accountId,
    anonymousCart: {
      currencyCode,
      items
    },
    anonymousCartSelector,
    Cart,
    shopId
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

  expect(Cart.insertOne).toHaveBeenCalledWith(newCart);

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(result).toEqual(newCart);
});

test("throws if insertOne fails", async () => {
  Cart.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 0 } }));

  const promise = convertAnonymousCartToNewAccountCart({
    accountId,
    anonymousCart: {
      currencyCode,
      items
    },
    anonymousCartSelector,
    Cart,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if deleteOne fails", async () => {
  Cart.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  Cart.deleteOne.mockReturnValueOnce(Promise.resolve({ deletedCount: 0 }));

  const promise = convertAnonymousCartToNewAccountCart({
    accountId,
    anonymousCart: {
      currencyCode,
      items
    },
    anonymousCartSelector,
    Cart,
    shopId
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
