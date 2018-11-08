import mockContext, { mockCollection } from "/imports/test-utils/helpers/mockContext";
import createFlatRateFulfillmentRestrictionMutation from "./createFlatRateFulfillmentRestriction";


// Create mock context with FlatRateFulfillmentRestrictions collection
mockContext.collections.FlatRateFulfillmentRestrictions = mockCollection("FlatRateFulfillmentRestrictions");
mockContext.userHasPermission.mockReturnValueOnce(true);

test("add a flat rate fulfillment restriction", async () => {
  mockContext.collections.FlatRateFulfillmentRestrictions.insertOne.mockReturnValueOnce(Promise.resolve({}));

  const result = await createFlatRateFulfillmentRestrictionMutation(mockContext, {
    _id: "restriction123",
    shopId: "shop123",
    restriction: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "erik", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });

  expect(result).toEqual({
    restriction: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "erik", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });
});
