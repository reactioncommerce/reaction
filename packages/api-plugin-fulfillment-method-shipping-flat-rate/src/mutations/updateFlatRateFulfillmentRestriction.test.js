import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateFlatRateFulfillmentRestrictionMutation from "./updateFlatRateFulfillmentRestriction.js";


// Create mock context with FulfillmentRestrictions collection
mockContext.collections.FulfillmentRestrictions = mockCollection("FulfillmentRestrictions");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

const restriction = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] }
};

const updatedRestriction = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "john", propertyType: "string", operator: "eq" },
    { property: "productType", value: "gun", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] }
};

test("update a flat rate fulfillment restriction", async () => {
  mockContext.collections.FulfillmentRestrictions.updateOne.mockReturnValueOnce(Promise.resolve({
    ok: 1,
    updatedRestriction
  }));

  const result = await updateFlatRateFulfillmentRestrictionMutation(mockContext, {
    restriction,
    restrictionId: "restriction123",
    shopId: "shop123"
  });

  expect(result).toEqual({
    restriction: {
      _id: "restriction123",
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] },
      shopId: "shop123"
    }
  });
});
