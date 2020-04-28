import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createSurchargeMutation from "./createSurcharge.js";


// Create mock context with Surcharges collection
mockContext.collections.Surcharges = mockCollection("Surcharges");
mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

const surchargeAttributes = [
  { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
  { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
];

const surchargeMessagesByLanguage = [
  {
    content: "You are shipping hazardous items, there is a 19.99 surcharge",
    language: "en"
  }, {
    content: "Spanish - You are shipping hazardous items, there is a 19.99 surcharge",
    language: "es"
  }
];

const surchargeDestination = { region: ["CO", "NY"] };

test("add a surcharge", async () => {
  mockContext.collections.Surcharges.insertOne.mockReturnValueOnce(Promise.resolve({}));

  const result = await createSurchargeMutation(mockContext, {
    shopId: "shop123",
    surcharge: {
      amount: 19.99,
      messagesByLanguage: surchargeMessagesByLanguage,
      type: "surcharge",
      attributes: surchargeAttributes,
      destination: surchargeDestination
    }
  });

  expect(result.surcharge.shopId).toEqual("shop123");
  expect(result.surcharge.createdAt).toEqual(jasmine.any(Date));
  expect(result.surcharge.amount).toEqual(19.99);
  expect(result.surcharge.messagesByLanguage).toEqual(surchargeMessagesByLanguage);
  expect(result.surcharge.attributes).toEqual(surchargeAttributes);
  expect(result.surcharge.destination).toEqual(surchargeDestination);
  expect(typeof result.surcharge._id).toEqual("string");
  expect(typeof result.surcharge.createdAt).toEqual("object");
});
