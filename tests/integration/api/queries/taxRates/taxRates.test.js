import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const taxRatesQuery = importAsString("./taxRatesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const taxRateDocuments = [];

for (let index = 10; index < 23; index += 1) {
  const doc = Factory.TaxRates.makeOne({
    _id: `taxRate-${index}`,
    region: "CA",
    rate: index / 100,
    shopId: internalShopId,
    country: "USA",
    postal: `90${index}`,
    taxCode: "CODE"
  });

  taxRateDocuments.push(doc);
}

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:taxRates/read"],
  slug: "admin",
  shopId: internalShopId
});

const customerGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["customer"],
  slug: "customer",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const mockCustomerAccount = Factory.Account.makeOne({
  groups: [customerGroup._id],
  shopId: internalShopId
});

let testApp;
let taxRates;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  await Promise.all(taxRateDocuments.map((doc) => (
    testApp.collections.Taxes.insertOne(doc)
  )));

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  taxRates = testApp.query(taxRatesQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("throws access-denied when getting taxRates if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await taxRates({
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("returns TaxRates records if user is an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await taxRates({
    shopId: opaqueShopId,
    first: 5,
    offset: 0
  });
  expect(result.taxRates.nodes.length).toEqual(5);
  expect(result.taxRates.nodes[0].postal).toEqual("9010");
  expect(result.taxRates.nodes[4].postal).toEqual("9014");
});


test("returns TaxRates records on second page if user is an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await taxRates({
    shopId: opaqueShopId,
    first: 5,
    offset: 5
  });
  expect(result.taxRates.nodes.length).toEqual(5);
  expect(result.taxRates.nodes[0].postal).toEqual("9015");
  expect(result.taxRates.nodes[4].postal).toEqual("9019");
});
