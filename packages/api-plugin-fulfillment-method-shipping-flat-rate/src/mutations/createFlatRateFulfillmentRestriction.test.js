import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createFlatRateFulfillmentRestrictionMutation from "./createFlatRateFulfillmentRestriction.js";

mockContext.validatePermissions = jest.fn().mockName("validatePermissions");
// Create mock context with FulfillmentRestrictions collection
mockContext.collections.FulfillmentRestrictions = mockCollection("FulfillmentRestrictions");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

test("add a flat rate fulfillment restriction", async () => {
  mockContext.collections.FulfillmentRestrictions.insertOne.mockReturnValueOnce(Promise.resolve({}));

  const result = await createFlatRateFulfillmentRestrictionMutation(mockContext, {
    _id: "restriction123",
    shopId: "shop123",
    restriction: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });

  expect(result).toEqual({
    restriction: {
      _id: expect.any(String),
      shopId: "shop123",
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });
});
