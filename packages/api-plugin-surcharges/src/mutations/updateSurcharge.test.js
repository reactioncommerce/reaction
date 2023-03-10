import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateSurchargeMutation from "./updateSurcharge.js";


// Create mock context with Surcharges collection
mockContext.collections.Surcharges = mockCollection("Surcharges");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

const createdAt = new Date();

const updatedSurcharge = {
  updatedAt: jasmine.any(Date),
  type: "surcharge",
  attributes: [
    { property: "vendor", value: "john", propertyType: "string", operator: "eq" },
    { property: "productType", value: "gun", propertyType: "string", operator: "eq" }
  ],
  createdAt,
  destination: { region: ["NJ", "WY"] },
  amount: 17.99,
  messagesByLanguage: [
    {
      content: "Updated Message English",
      language: "en"
    }, {
      content: "Updated Message Spanish",
      language: "es"
    }
  ]
};

const newSurcharge = {
  type: "surcharge",
  attributes: [
    { property: "vendor", value: "john", propertyType: "string", operator: "eq" },
    { property: "productType", value: "gun", propertyType: "string", operator: "eq" }
  ],
  createdAt,
  destination: { region: ["NJ", "WY"] },
  amount: 17.99,
  messagesByLanguage: [
    {
      content: "Updated Message English",
      language: "en"
    }, {
      content: "Updated Message Spanish",
      language: "es"
    }
  ]
};

test("update a surcharge", async () => {
  mockContext.collections.Surcharges.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({
    matchedCount: 1,
    value: updatedSurcharge
  }));

  const result = await updateSurchargeMutation(mockContext, {
    surchargeId: "surcharge123",
    surcharge: newSurcharge,
    shopId: "shop123"
  });

  expect(result.surcharge).toEqual(updatedSurcharge);
});
