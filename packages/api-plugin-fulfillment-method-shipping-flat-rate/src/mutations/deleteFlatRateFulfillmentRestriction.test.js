import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import deleteFlatRateFulfillmentRestrictionMutation from "./deleteFlatRateFulfillmentRestriction.js";


// Create mock context with FulfillmentRestrictions collection
mockContext.collections.FulfillmentRestrictions = mockCollection("FulfillmentRestrictions");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

const value = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] }
};

test("delete a flat rate fulfillment restriction", async () => {
  mockContext.collections.FulfillmentRestrictions.findOneAndDelete.mockReturnValueOnce(Promise.resolve({
    ok: 1,
    value
  }));

  const result = await deleteFlatRateFulfillmentRestrictionMutation(mockContext, {
    restrictionId: "restriction123",
    shopId: "shop123"
  });

  expect(result).toEqual({
    restriction: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });
});
