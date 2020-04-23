import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const flatRateFulfillmentMethodsQuery = importAsString("./flatRateFulfillmentMethodsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const fulfillmentMethodDocs = [];
const shopName = "Test Shop";

const groups = ["Standard", "Priority", "Next-Day"];

for (let index = 10; index < 40; index += 1) {
  const group = groups[Math.floor(index / 10) - 1];

  const mockMethod = {
    _id: `method-${index}`,
    name: `method-${index}`,
    shopId: internalShopId,
    label: `${group} ${index}`,
    handling: index * 0.5,
    rate: index * 10,
    cost: index * 5,
    isEnabled: true,
    fulfillmentTypes: ["shipping"],
    group
  };

  fulfillmentMethodDocs.push(mockMethod);
}

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shippingMethods/read"],
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
let queryFulfillmentMethods;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  queryFulfillmentMethods = testApp.query(flatRateFulfillmentMethodsQuery);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  await Promise.all(fulfillmentMethodDocs.map((doc) => (
    testApp.collections.Shipping.insertOne(doc)
  )));
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("expect a list of fulfillment methods", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryFulfillmentMethods({
      shopId: opaqueShopId,
      first: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.flatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.flatRateFulfillmentMethods.nodes[0].label).toEqual("Standard 10");
  expect(result.flatRateFulfillmentMethods.nodes[9].label).toEqual("Standard 19");
});

test("expect a list of fulfillment methods on the second page", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryFulfillmentMethods({
      shopId: opaqueShopId,
      first: 10,
      offset: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.flatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.flatRateFulfillmentMethods.nodes[0].label).toEqual("Priority 20");
  expect(result.flatRateFulfillmentMethods.nodes[9].label).toEqual("Priority 29");
});

test("expect a list of fulfillment methods on the third page", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryFulfillmentMethods({
      shopId: opaqueShopId,
      first: 10,
      offset: 20
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.flatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.flatRateFulfillmentMethods.nodes[0].label).toEqual("Next-Day 30");
  expect(result.flatRateFulfillmentMethods.nodes[9].label).toEqual("Next-Day 39");
});

test("throws access-denied when getting fulfillment methods if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await queryFulfillmentMethods({
      shopId: opaqueShopId,
      first: 10
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});
