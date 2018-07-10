import mockContext from "/imports/test-utils/helpers/mockContext";
import createCart from "./createCart";

jest.mock("../util/addCartItems", () => jest.fn().mockImplementation(() => Promise.resolve({
  incorrectPriceFailures: [],
  minOrderQuantityFailures: [],
  updatedItemList: [
    {
      _id: "CartItemID",
      addedAt: new Date(),
      createdAt: new Date(),
      productId: "productId",
      quantity: 1,
      shopId: "shopId",
      title: "TITLE",
      updatedAt: new Date(),
      variantId: "variantId",
      isTaxable: false,
      priceWhenAdded: {
        amount: 9.99,
        currencyCode: "USD"
      }
    }
  ]
})));

const items = [{
  productConfiguration: {
    productId: "444",
    productVariantId: "555"
  },
  quantity: 1
}];

test("creates an anonymous cart if no user is logged in", async () => {
  mockContext.collections.Catalog.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "catalogId",
    product: {
      _id: "productId",
      productId: "productId",
      variants: [
        {
          _id: "variantId",
          currency: "USD",
          price: 9.99,
          title: "TITLE",
          variantId: "variantId"
        }
      ]
    }
  }));

  mockContext.collections.Cart.insertOne.mockImplementation(async (doc) => ({
    ops: [doc],
    result: {
      ok: 1
    }
  }));

  const result = await createCart({
    ...mockContext,
    userId: null
  }, {
    items,
    shopId: "123"
  });

  expect(result).toEqual({
    cart: {
      _id: jasmine.any(String),
      accountId: null,
      anonymousAccessToken: jasmine.any(String),
      billing: [
        {
          _id: jasmine.any(String),
          currency: { userCurrency: "USD" }
        }
      ],
      currencyCode: "USD",
      createdAt: jasmine.any(Date),
      items: [
        {
          _id: "CartItemID",
          addedAt: jasmine.any(Date),
          createdAt: jasmine.any(Date),
          productId: "productId",
          quantity: 1,
          shopId: "shopId",
          title: "TITLE",
          updatedAt: jasmine.any(Date),
          variantId: "variantId",
          isTaxable: false,
          priceWhenAdded: {
            amount: 9.99,
            currencyCode: "USD"
          }
        }
      ],
      shopId: "123",
      updatedAt: jasmine.any(Date),
      workflow: {
        status: "new"
      }
    },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: [],
    token: jasmine.any(String)
  });
});

test("creates an account cart if logged in");

test("throws if no items");

test("creates if no items and shouldCreateWithoutItems is true");

test("throws creating account cart if one already exists");

test("if all items are invalid, does not create the cart");

test("if all items are invalid and shouldCreateWithoutItems is true, creates the cart");

test("throws if insertOne fails");
