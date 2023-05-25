import ReactionError from "@reactioncommerce/reaction-error";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateFulfillmentMethodMutation from "./updateFulfillmentMethod.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
mockContext.collections.Fulfillment = mockCollection("Fulfillment");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("throws if required fields are not supplied", async () => {
  const fulfillmentMethodInput = {
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    method: {
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99
    }
  };

  const expectedError = "Method ID is required";
  await expect(updateFulfillmentMethodMutation(mockContext, fulfillmentMethodInput)).rejects.toThrow(expectedError);
});

test("throws if the fulfillmentType does not exists", async () => {
  mockContext.collections.Fulfillment.findOne.mockReturnValueOnce(Promise.resolve(undefined));

  const fulfillmentMethodInput = {
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    methodId: "fulfillmentMethodId",
    method: {
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99
    }
  };
  const expectedError = new ReactionError("server-error", "Fulfillment Type / Method does not exist");
  await expect(updateFulfillmentMethodMutation(mockContext, fulfillmentMethodInput)).rejects.toThrow(expectedError);
});

test("throws if the fulfillmentMethod does not exists", async () => {
  mockContext.collections.Fulfillment.findOne.mockReturnValueOnce(Promise.resolve({
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    methods: [{
      _id: "fulfillmentMethodId01",
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99
    }]
  }));

  const fulfillmentMethodInput = {
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    methodId: "fulfillmentMethodId02",
    method: {
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99
    }
  };
  const expectedError = new ReactionError("server-error", "Fulfillment Method does not exist");
  await expect(updateFulfillmentMethodMutation(mockContext, fulfillmentMethodInput)).rejects.toThrow(expectedError);
});

test("should update an existing fulfillment method", async () => {
  mockContext.collections.Fulfillment.updateOne.mockReturnValueOnce(Promise.resolve({ result: { matchedCount: 1 } }));
  mockContext.collections.Fulfillment.findOne.mockReturnValueOnce(Promise.resolve({
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    fulfillmentType: "Shipping",
    methods: [{
      _id: "fulfillmentMethodId01",
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99,
      fulfillmentMethod: "ups"
    }]
  }));

  const fulfillmentMethodInput = {
    fulfillmentTypeId: "fulfillmentType01",
    shopId: "SHOP_ID",
    methodId: "fulfillmentMethodId01",
    method: {
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      enabled: true,
      label: "ups",
      name: "ups",
      rate: 99,
      fulfillmentMethod: "ups"
    }
  };

  const expectedOutput = {
    method: {
      _id: "fulfillmentMethodId01",
      enabled: true,
      fulfillmentMethod: "ups",
      fulfillmentTypes: ["Shipping"],
      group: "Ground",
      handling: 99,
      label: "ups",
      name: "ups",
      rate: 99
    }
  };

  const result = await updateFulfillmentMethodMutation(mockContext, fulfillmentMethodInput);

  expect(result).toEqual(expectedOutput);
});
