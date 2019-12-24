import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateSurchargeMutation = importAsString("./CreateSurchargeMutation.graphql");
const DeleteSurchargeMutation = importAsString("./DeleteSurchargeMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
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

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["admin", "core"]
  }
});

let testApp;
let createSurcharge;
let deleteSurcharge;
let createdSurchargeOpaqueId;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({
    _id: internalShopId,
    name: shopName,
    currency: "USD",
    shopType: "merchant",
    slug: "my-shop"
  });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  createSurcharge = testApp.mutate(CreateSurchargeMutation);
  deleteSurcharge = testApp.mutate(DeleteSurchargeMutation);

  const { createSurcharge: createdSurcharge } = await createSurcharge({
    createSurchargeInput: {
      shopId: opaqueShopId,
      surcharge: {
        amount: 19.99,
        messagesByLanguage: surchargeMessagesByLanguage,
        type: "surcharge",
        attributes: surchargeAttributes,
        destination: surchargeDestination
      }
    }
  });
  createdSurchargeOpaqueId = createdSurcharge.surcharge._id;
});


afterAll(async () => {
  await testApp.collections.Surcharges.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.stop();
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

test("an authorized user can delete a surcharge", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;

  try {
    result = await deleteSurcharge({
      deleteSurchargeInput: {
        shopId: opaqueShopId,
        surchargeId: createdSurchargeOpaqueId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.deleteSurcharge.surcharge.shopId).toEqual(opaqueShopId);
  expect(result.deleteSurcharge.surcharge.amount.amount).toEqual(19.99);
  expect(result.deleteSurcharge.surcharge.messagesByLanguage).toEqual(surchargeMessagesByLanguage);
  expect(result.deleteSurcharge.surcharge.attributes).toEqual(surchargeAttributes);
  expect(result.deleteSurcharge.surcharge.destination).toEqual(surchargeDestination);
});


test("an unauthorized user cannot delete a surcharge", async () => {
  try {
    await deleteSurcharge({
      deleteSurchargeInput: {
        shopId: opaqueShopId,
        surchargeId: createdSurchargeOpaqueId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
