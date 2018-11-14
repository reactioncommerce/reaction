import mockContext, { mockCollection } from "/imports/test-utils/helpers/mockContext";
import updateSurchargeMutation from "./updateSurcharge";


// Create mock context with FlatRateFulfillmentSurcharges collection
mockContext.collections.FlatRateFulfillmentSurcharges = mockCollection("FlatRateFulfillmentSurcharges");
mockContext.userHasPermission.mockReturnValueOnce(true);

const surcharge = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] },
  surcharges: [
    {
      amount: "5.99",
      message: "Original Message",
      reason: "Original Reason"
    }
  ]
};

const updatedSurcharge = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "john", propertyType: "string", operator: "eq" },
    { property: "productType", value: "gun", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["NJ", "WY"] },
  surcharges: [
    {
      amount: "17.99",
      message: "Updated Message",
      reason: "Updated Reason"
    }
  ]
};

test("update a surcharge", async () => {
  mockContext.collections.FlatRateFulfillmentSurcharges.updateOne.mockReturnValueOnce(Promise.resolve({
    ok: 1,
    updatedSurcharge
  }));

  const result = await updateSurchargeMutation(mockContext, {
    surcharge,
    surchargeId: "surcharge123",
    shopId: "shop123"
  });

  expect(result).toEqual({
    surcharge: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] },
      surcharges: [
        {
          amount: "5.99",
          message: "Original Message",
          reason: "Original Reason"
        }
      ]
    }
  });
});
