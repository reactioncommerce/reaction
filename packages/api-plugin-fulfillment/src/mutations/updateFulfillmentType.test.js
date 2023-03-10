import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateFulfillmentTypeMutation from "./updateFulfillmentType.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
mockContext.collections.Fulfillment = mockCollection("Fulfillment");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("throws if required fields are not supplied", async () => {
  const fulfillmentTypeInput = {
    shopId: "SHOP_ID",
    label: "Shipping"
  };

  const expectedError = "Fulfillment type ID is required";
  await expect(updateFulfillmentTypeMutation(mockContext, fulfillmentTypeInput)).rejects.toThrow(expectedError);
});


test("should update an existing fulfillment type", async () => {
  mockContext.collections.Fulfillment.updateOne.mockReturnValueOnce(Promise.resolve({ result: { matchedCount: 1 } }));

  const fulfillmentTypeInput = {
    fulfillmentTypeId: "fulfillmentGroup01",
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    enabled: false,
    label: "Shipping"
  };

  const expectedOutput = {
    fulfillmentTypeId: "fulfillmentGroup01",
    shopId: "SHOP_ID",
    name: "fulfillmentType123",
    enabled: false,
    label: "Shipping"
  };

  const result = await updateFulfillmentTypeMutation(mockContext, fulfillmentTypeInput);

  expect(result).toEqual({
    fulfillmentType: expectedOutput
  });
});
