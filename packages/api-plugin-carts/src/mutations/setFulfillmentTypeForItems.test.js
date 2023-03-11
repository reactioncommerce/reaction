import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import setFulfillmentTypeForItems from "./setFulfillmentTypeForItems.js";

const dbCart = {
  _id: "cartId",
  items: [
    {
      _id: "cartItemId1",
      quantity: 5,
      price: {
        amount: 400,
        currencyCode: "mockCurrencyCode"
      },
      subtotal: {
        amount: 2000,
        currencyCode: "mockCurrencyCode"
      }
    },
    {
      _id: "cartItemId2",
      quantity: 5,
      price: {
        amount: 200,
        currencyCode: "mockCurrencyCode"
      },
      subtotal: {
        amount: 1000,
        currencyCode: "mockCurrencyCode"
      }
    }
  ]
};

const cartToken = "TOKEN";
const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("throws if cart to be updated not found", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(undefined));
  const expectedError = new ReactionError("not-found", "Cart not found");
  await expect(setFulfillmentTypeForItems(mockContext, {
    cartId: "cartId",
    cartToken,
    fulfillmentType: "shipping",
    itemIds: ["cartItemId"]
  })).rejects.toThrow(expectedError);
});

test("throws if invalid fulfillment type provided", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  const expectedError = new ReactionError("invalid-param", "Invalid Fulfillment Type received");
  await expect(setFulfillmentTypeForItems(mockContext, {
    cartId: "cartId",
    cartToken,
    fulfillmentType: "undecided",
    itemIds: ["cartItemId"]
  })).rejects.toThrow(expectedError);
});

test("throws if invalid fulfillment type provided", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));
  const expectedError = new ReactionError("invalid-param", "Item Ids not provided");
  await expect(setFulfillmentTypeForItems(mockContext, {
    cartId: "cartId",
    cartToken,
    fulfillmentType: "shipping",
    itemIds: []
  })).rejects.toThrow(expectedError);
});

test("sets the selected fulfillment type for each input group in the cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const result = await setFulfillmentTypeForItems(mockContext, {
    cartId: "cartId",
    cartToken,
    fulfillmentType: "shipping",
    itemIds: ["cartItemId2"]
  });

  const expected = {
    _id: "cartId",
    items: [
      {
        _id: "cartItemId1",
        quantity: 5,
        price: {
          amount: 400,
          currencyCode: "mockCurrencyCode"
        },
        subtotal: {
          amount: 2000,
          currencyCode: "mockCurrencyCode"
        }
      },
      {
        _id: "cartItemId2",
        selectedFulfillmentType: "shipping",
        quantity: 5,
        price: {
          amount: 200,
          currencyCode: "mockCurrencyCode"
        },
        subtotal: {
          amount: 1000,
          currencyCode: "mockCurrencyCode"
        }
      }
    ]
  };
  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({ cart: expected });
});
