import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import checkAndCreateFulfillmentType from "./checkAndCreateFulfillmentType.js";

test("should NOT call createFulfillmentType mutation", async () => {
  const shopId = "SHOP_ID";
  const fulfillment = {
    _id: "fulfillment123"
  };
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
  mockContext.mutations.createFulfillmentType = jest.fn().mockName("createFulfillmentType").mockReturnValueOnce(Promise.resolve(fulfillment));

  await checkAndCreateFulfillmentType(mockContext, shopId);
  expect(mockContext.mutations.createFulfillmentType).not.toHaveBeenCalled();
});

test("should  call createFulfillmentType mutation", async () => {
  const fulfillment = { _id: "fulfillment123" };
  const shopId = "SHOP_ID";

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
  mockContext.mutations.createFulfillmentType = jest.fn().mockName("createFulfillmentType").mockReturnValueOnce(Promise.resolve(fulfillment));

  await checkAndCreateFulfillmentType(mockContext, shopId);
  expect(mockContext.mutations.createFulfillmentType).toHaveBeenCalled();
});
