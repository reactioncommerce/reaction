import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import selectFulfillmentOptionForGroup from "./selectFulfillmentOptionForGroup";

jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "cartId",
  shipping: [{
    _id: "group1",
    itemIds: ["123"],
    shipmentQuotes: [{
      rate: 0,
      method: {
        _id: "valid-method"
      }
    }],
    type: "shipping"
  }]
})));

const fakeCart = Factory.Cart.makeOne();

test("selects an existing shipping method", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  const result = await selectFulfillmentOptionForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1",
    fulfillmentMethodId: "valid-method"
  });
  expect(result).toEqual({
    cart: {
      _id: "cartId",
      shipping: [{
        _id: "group1",
        itemIds: ["123"],
        shipmentQuotes: [{
          rate: 0,
          method: {
            _id: "valid-method"
          }
        }],
        shipmentMethod: {
          _id: "valid-method"
        },
        type: "shipping"
      }]
    }
  });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    "_id": "cartId",
    "shipping._id": "group1"
  }, {
    $set: {
      "shipping.$.shipmentMethod": {
        _id: "valid-method"
      }
    }
  });
});

test("throws if there is no fulfillment group with the given ID", async () => {
  await expect(selectFulfillmentOptionForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group2",
    fulfillmentMethodId: "valid-method"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if there is no fulfillment method with the given ID among the options", async () => {
  await expect(selectFulfillmentOptionForGroup(mockContext, {
    cartId: "cartId",
    fulfillmentGroupId: "group1",
    fulfillmentMethodId: "invalid-method"
  })).rejects.toThrowErrorMatchingSnapshot();
});
