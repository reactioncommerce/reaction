import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const TaxServicesQuery = importAsString("./TaxServicesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let taxServices;

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:taxes/read"],
  slug: "admin",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

beforeAll(async () => {
  testApp = new TestApp();

  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);

  taxServices = testApp.query(TaxServicesQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot view tax services", async () => {
  try {
    await taxServices({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("an admin user can view tax services", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await taxServices({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.taxServices[0].name).toEqual("custom-rates");
  expect(result.taxServices[0].pluginName).toEqual("reaction-taxes-rates");
});
