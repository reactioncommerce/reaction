import mockContext, { mockCollection } from "/imports/test-utils/helpers/mockContext";
import createSurchargeMutation from "./createSurcharge";


// Create mock context with Surcharges collection
mockContext.collections.Surcharges = mockCollection("Surcharges");
mockContext.userHasPermission.mockReturnValueOnce(true);

test("add a surcharge", async () => {
  mockContext.collections.Surcharges.insertOne.mockReturnValueOnce(Promise.resolve({}));

  const result = await createSurchargeMutation(mockContext, {
    _id: "surcharge123",
    shopId: "shop123",
    surcharge: {
      amount: "19.99",
      messagesByLanguage: [
        {
          content: "You are shipping hazardous items, there is a 19.99 surcharge",
          language: "en"
        }, {
          content: "Spanish - You are shipping hazardous items, there is a 19.99 surcharge",
          language: "es"
        }
      ],
      type: "surcharge",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });

  expect(result).toEqual({
    surcharge: {
      _id: jasmine.any(String),
      amount: 19.99,
      messagesByLanguage: [
        {
          content: "You are shipping hazardous items, there is a 19.99 surcharge",
          language: "en"
        }, {
          content: "Spanish - You are shipping hazardous items, there is a 19.99 surcharge",
          language: "es"
        }
      ],
      type: "surcharge",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });
});
