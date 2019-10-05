import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createCart from "./createCart.js";

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
      price: {
        amount: 9.99,
        currencyCode: "USD"
      },
      priceWhenAdded: {
        amount: 9.99,
        currencyCode: "USD"
      },
      subtotal: {
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

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("creates an anonymous cart if no user is logged in", async () => {
  const originalAccountId = mockContext.accountId;
  mockContext.accountId = null;

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
      currencyCode: "USD",
      createdAt: jasmine.any(Date),
      referenceId: jasmine.any(String),
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
          price: {
            amount: 9.99,
            currencyCode: "USD"
          },
          priceWhenAdded: {
            amount: 9.99,
            currencyCode: "USD"
          },
          subtotal: {
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

  mockContext.accountId = originalAccountId;
});

// TODO need to write these
test.skip("creates an account cart if logged in", () => {});

test.skip("throws if no items", () => {});

test.skip("creates if no items and shouldCreateWithoutItems is true", () => {});

test.skip("throws creating account cart if one already exists", () => {});

test.skip("if all items are invalid, does not create the cart", () => {});

test.skip("if all items are invalid and shouldCreateWithoutItems is true, creates the cart", () => {});

test.skip("throws if insertOne fails", () => {});
