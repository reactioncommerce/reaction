import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import selectFulfillmentOptionForGroup from "./selectFulfillmentOptionForGroup.js";

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

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("selects an existing shipping method", async () => {
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
        type: "shipping",
        shipmentMethod: {
          _id: "valid-method"
        }
      }],
      updatedAt: jasmine.any(Date)
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
