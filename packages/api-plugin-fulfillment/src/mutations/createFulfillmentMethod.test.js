import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createFulfillmentMethodMutation from "./createFulfillmentMethod.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
mockContext.collections.Fulfillment = mockCollection("Fulfillment");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("throws if required fields are not supplied", async () => {
  const fulfillmentMethodInput = {
    method: {
      shopId: "SHOP_ID",
      cost: 99,
      fulfillmentMethod: "flatRates",
      displayMessageMethod: "Sample display message"
    },
    fulfillmentTypeId: "fulfillment123",
    shopId: "SHOP_ID"
  };

  const expectedError = "Fulfillment types is required";
  await expect(createFulfillmentMethodMutation(mockContext, fulfillmentMethodInput)).rejects.toThrow(expectedError);
});

test("add a new fulfillment method", async () => {
  mockContext.collections.Fulfillment.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  mockContext.collections.Fulfillment.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "fulfillment123",
    name: "Default Shipping Provider",
    shopId: "SHOP_ID",
    provider: {
      enabled: true,
      label: "Shipping",
      name: "shipping"
    },
    fulfillmentType: "shipping"
  }));


  const result = await createFulfillmentMethodMutation(mockContext, {
    method: {
      shopId: "SHOP_ID",
      cost: 99,
      handling: 99,
      rate: 99,
      fulfillmentTypes: ["shipping"],
      group: "Ground",
      enabled: true,
      label: "Flat Rate",
      name: "flatRates",
      fulfillmentMethod: "flatRates",
      displayMessageMethod: "Sample display message"
    },
    fulfillmentTypeId: "fulfillment123",
    shopId: "SHOP_ID"
  });

  expect(result).toEqual({
    method: {
      _id: expect.any(String),
      cost: 99,
      handling: 99,
      rate: 99,
      fulfillmentTypes: ["shipping"],
      group: "Ground",
      enabled: true,
      label: "Flat Rate",
      name: "flatRates",
      fulfillmentMethod: "flatRates",
      displayMessageMethod: "Sample display message"
    }
  });
});
