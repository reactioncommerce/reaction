import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateFulfillmentTypeMutation from "./updateFulfillmentType.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
mockContext.collections.Fulfillment = mockCollection("Fulfillment");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("throws if required fields are not supplied", async () => {
  const fulfillmentTypeInput = {
    fulfillmentGroupId: "fulfillmentGroup01",
    shopId: "SHOP_ID",
    label: "Shipping"
  };

  await expect(updateFulfillmentTypeMutation(mockContext, fulfillmentTypeInput)).rejects.toThrowErrorMatchingSnapshot();
});


test("should update an existing fulfillment type", async () => {
  mockContext.collections.Fulfillment.updateOne.mockReturnValueOnce(Promise.resolve({ result: { matchedCount: 1 } }));

  const fulfillmentTypeInput = {
    fulfillmentGroupId: "fulfillmentGroup01",
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    enabled: false,
    label: "Shipping"
  };

  const expectedOutput = {
    fulfillmentGroupId: "fulfillmentGroup01",
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    enabled: false,
    label: "Shipping"
  };

  const result = await updateFulfillmentTypeMutation(mockContext, fulfillmentTypeInput);

  expect(result).toEqual({
    group: expectedOutput
  });
});
