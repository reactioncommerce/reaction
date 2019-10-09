import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import deleteSurchargeMutation from "./deleteSurcharge.js";


// Create mock context with Surcharges collection
mockContext.collections.Surcharges = mockCollection("Surcharges");
mockContext.userHasPermission.mockReturnValueOnce(true);

const value = {
  type: "surcharge",
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] },
  amount: {
    amount: 19.99,
    currencyCode: "USD"
  },
  reason: "Hazardous items",
  message: "A surcharge will apply to this shipment because of a hazardous item."
};

test("delete a surcharge", async () => {
  mockContext.collections.Surcharges.findOneAndDelete.mockReturnValueOnce(Promise.resolve({
    ok: 1,
    value
  }));

  const result = await deleteSurchargeMutation(mockContext, {
    surchargeId: "surcharge123",
    shopId: "shop123"
  });

  expect(result).toEqual({
    surcharge: {
      type: "surcharge",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] },
      amount: {
        amount: 19.99,
        currencyCode: "USD"
      },
      reason: "Hazardous items",
      message: "A surcharge will apply to this shipment because of a hazardous item."
    }
  });
});
