import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createFulfillmentTypeMutation from "./createFulfillmentType.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
mockContext.collections.Fulfillment = mockCollection("Fulfillment");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("throws if required fields are not supplied", async () => {
  const fulfillmentTypeInput = {
    shopId: "SHOP_ID"
    // name: "fulfillmentType123"
  };

  const expectedError = "Name is required";
  await expect(createFulfillmentTypeMutation(mockContext, fulfillmentTypeInput)).rejects.toThrow(expectedError);
});

test("returns if the fulfillmentType added already exists", async () => {
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

  const fulfillmentTypeInput = {
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    fulfillmentType: "shipping",
    provider: {
      enabled: true,
      label: "Shipping",
      name: "shipping"
    }
  };

  const result = await createFulfillmentTypeMutation(mockContext, fulfillmentTypeInput);
  expect(result).toEqual({
    fulfillmentType: {
      name: "fulfillmentType123",
      fulfillmentType: "shipping"
    }
  });

  expect(mockContext.validatePermissions).toHaveBeenCalledTimes(0);
});

test("add a new fulfillment type", async () => {
  mockContext.collections.Fulfillment.findOne.mockReturnValueOnce(Promise.resolve(undefined));
  mockContext.collections.Fulfillment.insertOne.mockReturnValueOnce(Promise.resolve({ result: { insertedCount: 1 } }));

  const fulfillmentTypeInput = {
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    fulfillmentType: "shipping",
    provider: {
      enabled: true,
      label: "Shipping",
      name: "shipping"
    }
  };

  const result = await createFulfillmentTypeMutation(mockContext, fulfillmentTypeInput);

  expect(result).toEqual({
    fulfillmentType: {
      name: "fulfillmentType123",
      fulfillmentType: "shipping"
    }
  });
});
