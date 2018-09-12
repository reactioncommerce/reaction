import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import updateFulfillmentOptionsForGroup from "./updateFulfillmentOptionsForGroup";

jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "cartId",
  shipping: [{
    _id: "group1",
    itemIds: ["123"],
    type: "shipping"
  }]
})));

const fakeCart = Factory.Cart.makeOne();
const fakeQuote = Factory.ShipmentQuote.makeOne();
const mockGetFulfillmentMethodsWithQuotes = jest.fn().mockName("getFulfillmentMethodsWithQuotes");

beforeAll(() => {
  mockContext.services = {
    fulfillment: {
      getFulfillmentMethodsWithQuotes: mockGetFulfillmentMethodsWithQuotes
    }
  };
});

beforeEach(() => {
  mockGetFulfillmentMethodsWithQuotes.mockClear();
});

test("updates cart properly for empty rates", async () => {
  mockGetFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([]));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });
  expect(result).toEqual({ cart: fakeCart });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    "_id": "cartId",
    "shipping._id": "group1"
  }, {
    $set: {
      "shipping.$.shipmentQuotes": [],
      "shipping.$.shipmentQuotesQueryStatus": { requestStatus: "pending" }
    }
  });
});

test("updates cart properly for error rates", async () => {
  mockGetFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([{
    requestStatus: "error",
    shippingProvider: "all",
    message: "All requests for shipping methods failed."
  }]));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });
  expect(result).toEqual({ cart: fakeCart });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    "_id": "cartId",
    "shipping._id": "group1"
  }, {
    $set: {
      "shipping.$.shipmentQuotes": [],
      "shipping.$.shipmentQuotesQueryStatus": {
        requestStatus: "error",
        shippingProvider: "all",
        message: "All requests for shipping methods failed."
      }
    }
  });
});

test("updates cart properly for success rates", async () => {
  mockGetFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([fakeQuote]));
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1"
  });
  expect(result).toEqual({ cart: fakeCart });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    "_id": "cartId",
    "shipping._id": "group1"
  }, {
    $set: {
      "shipping.$.shipmentQuotes": [fakeQuote],
      "shipping.$.shipmentQuotesQueryStatus": {
        requestStatus: "success",
        numOfShippingMethodsFound: 1
      }
    }
  });
});

test("throws if there is no fulfillment group with the given ID", async () => {
  await expect(updateFulfillmentOptionsForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group2"
  })).rejects.toThrowErrorMatchingSnapshot();
});
