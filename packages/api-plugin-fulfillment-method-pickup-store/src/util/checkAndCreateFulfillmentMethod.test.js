import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import checkAndCreateFulfillmentMethod from "./checkAndCreateFulfillmentMethod.js";

test("should call createFulfillmentMethod mutation", async () => {
  const shopId = "SHOP_ID";
  const fulfillment = {
    _id: "fulfillment123"
  };
  const fulfillmentTypeId = fulfillment._id;
  const groupInfo = {
    name: "Pickup Provider",
    shopId: "SHOP_ID",
    provider: {
      enabled: true,
      label: "Pickup",
      name: "pickup"
    },
    fulfillmentType: "pickup"
  };
  const method = {
    name: "store",
    label: "Pickup from Store",
    fulfillmentTypes: ["pickup"],
    group: "Ground",
    cost: 0,
    handling: 0,
    rate: 0,
    enabled: true,
    fulfillmentMethod: "store",
    displayMessageMethod: "Placeholder for display message"
  };

  mockContext.getInternalContext = () => ({
    ...mockContext,
    account: null,
    accountId: null,
    isInternalCall: true,
    user: null,
    userHasPermission: async () => true,
    userId: null,
    validatePermissions: async () => undefined
  });

  mockContext.collections.Fulfillment = {
    findOne: jest.fn().mockReturnValueOnce(Promise.resolve(groupInfo))
  };
  mockContext.mutations.createFulfillmentMethod = jest.fn().mockName("createFulfillmentMethod").mockReturnValueOnce(Promise.resolve(method));

  await checkAndCreateFulfillmentMethod(mockContext, { shopId, fulfillmentTypeId, method });
  expect(mockContext.mutations.createFulfillmentMethod).toHaveBeenCalled();
});

test("should throw error and NOT call createFulfillmentMethod mutation", async () => {
  const fulfillment = { _id: "fulfillment123" };
  const shopId = "SHOP_ID";
  const fulfillmentTypeId = fulfillment._id;
  const method = {
    name: "store",
    label: "Pickup from Store",
    fulfillmentTypes: ["pickup"],
    group: "Ground",
    cost: 0,
    handling: 0,
    rate: 0,
    enabled: true,
    fulfillmentMethod: "store",
    displayMessageMethod: "Placeholder for display message"
  };

  mockContext.getInternalContext = () => ({
    ...mockContext,
    account: null,
    accountId: null,
    isInternalCall: true,
    user: null,
    userHasPermission: async () => true,
    userId: null,
    validatePermissions: async () => undefined
  });

  mockContext.collections.Fulfillment = {
    findOne: jest.fn().mockReturnValueOnce(undefined)
  };
  mockContext.mutations.createFulfillmentMethod = jest.fn().mockName("createFulfillmentMethod").mockReturnValueOnce(Promise.resolve(method));

  const expectedError = "Unable to create fulfillment method Pickup-Store without defined type";
  await expect(checkAndCreateFulfillmentMethod(mockContext, { shopId, fulfillmentTypeId, method })).rejects.toThrowError(expectedError);
});
