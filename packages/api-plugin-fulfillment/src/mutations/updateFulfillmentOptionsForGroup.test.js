import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "../tests/factory.js";
import updateFulfillmentOptionsForGroup from "./updateFulfillmentOptionsForGroup.js";


const fakeCart = Factory.Cart.makeOne();
const fakeQuote = Factory.ShipmentQuote.makeOne();
const mockFulfillmentMethodsWithQuotes = jest.fn().mockName("fulfillmentMethodsWithQuotes");
const mockGetCommonOrderForCartGroup = jest.fn().mockName("getCommonOrderForCartGroup");

beforeAll(() => {
  mockContext.queries = {
    fulfillmentMethodsWithQuotes: mockFulfillmentMethodsWithQuotes,
    getCommonOrderForCartGroup: mockGetCommonOrderForCartGroup
  };
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
  if (!mockContext.mutations.removeMissingItemsFromCart) {
    mockContext.mutations.removeMissingItemsFromCart = jest.fn().mockName("context.mutations.removeMissingItemsFromCart");
  }
});

beforeEach(() => {
  mockFulfillmentMethodsWithQuotes.mockClear();

  mockContext.queries.getCartById = jest.fn().mockName("getCartById").mockReturnValueOnce(Promise.resolve({
    _id: "cartId",
    items: [{
      _id: "123",
      price: {
        amount: 19.99
      },
      priceWhenAdded: {
        amount: 19.99
      },
      subtotal: {
        amount: 19.99
      }
    }],
    shipping: [{
      _id: "group1",
      itemIds: ["123"],
      type: "shipping"
    }]
  }));
});

test("updates cart properly for empty rates", async () => {
  mockFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([]));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [{
        _id: "123",
        price: {
          amount: 19.99
        },
        priceWhenAdded: {
          amount: 19.99
        },
        subtotal: {
          amount: 19.99
        }
      }],
      shipping: [{
        _id: "group1",
        itemIds: ["123"],
        type: "shipping",
        shipmentQuotes: [],
        shipmentQuotesQueryStatus: { requestStatus: "pending" }
      }],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("updates cart properly for error rates", async () => {
  mockFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([{
    requestStatus: "error",
    shippingProvider: "all",
    message: "All requests for shipping methods failed."
  }]));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [{
        _id: "123",
        price: {
          amount: 19.99
        },
        priceWhenAdded: {
          amount: 19.99
        },
        subtotal: {
          amount: 19.99
        }
      }],
      shipping: [{
        _id: "group1",
        itemIds: ["123"],
        type: "shipping",
        shipmentQuotes: [],
        shipmentQuotesQueryStatus: {
          requestStatus: "error",
          shippingProvider: "all",
          message: "All requests for shipping methods failed."
        }
      }],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("updates cart properly for success rates", async () => {
  mockFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([fakeQuote]));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [{
        _id: "123",
        price: {
          amount: 19.99
        },
        priceWhenAdded: {
          amount: 19.99
        },
        subtotal: {
          amount: 19.99
        }
      }],
      shipping: [{
        _id: "group1",
        itemIds: ["123"],
        type: "shipping",
        shipmentQuotes: [fakeQuote],
        shipmentQuotesQueryStatus: {
          requestStatus: "success",
          numOfShippingMethodsFound: 1
        }
      }],
      updatedAt: jasmine.any(Date)
    }
  });
});

test("throws if there is no fulfillment group with the given ID", async () => {
  const expectedError = "Fulfillment group with ID group2 not found in cart with ID cartId";
  await expect(updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group2"
  })).rejects.toThrow(expectedError);
});
