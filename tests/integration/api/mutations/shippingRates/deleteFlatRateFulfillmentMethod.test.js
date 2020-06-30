import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const DeleteFlatRateFulfillmentMethodMutation = importAsString("./DeleteFlatRateFulfillmentMethodMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const groups = ["Standard", "Priority", "Next-Day"];
const mockFulfillmentMethodId = "mockMethod";
const opaqueMockFulfillmentMethodId = encodeOpaqueId("reaction/fulfillmentMethod", mockFulfillmentMethodId);

const mockFulfillmentMethodData = {
  name: "mockMethod",
  label: `${groups[0]} mockMethod`,
  handling: 9.5,
  rate: 90,
  cost: 9,
  enabled: true,
  fulfillmentTypes: ["shipping"],
  group: groups[0]
};

const mockFulfillmentMethod = Factory.FulfillmentMethod.makeOne({
  ...mockFulfillmentMethodData,
  _id: mockFulfillmentMethodId,
  shopId: internalShopId
});

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shippingMethods/delete"],
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

const mockCustomerAccount = Factory.Account.makeOne({
  groups: [customerGroup._id],
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

let testApp;
let deleteFlatRateFulfillmentMethod;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  deleteFlatRateFulfillmentMethod = testApp.mutate(DeleteFlatRateFulfillmentMethodMutation);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.collections.Shipping.insertOne({
    methods: [{
      _id: mockFulfillmentMethodId,
      shopId: internalShopId,
      ...mockFulfillmentMethod
    }],
    shopId: internalShopId
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can not delete flat rate fulfillment method if admin is not logged in", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await deleteFlatRateFulfillmentMethod({
      input: {
        methodId: opaqueMockFulfillmentMethodId,
        shopId: opaqueShopId
      }
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("user can delete flat rate fulfillment method if they have `reaction:legacy:shippingMethods/delete` permissions", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await deleteFlatRateFulfillmentMethod({
      input: {
        methodId: opaqueMockFulfillmentMethodId,
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.deleteFlatRateFulfillmentMethod.method).toEqual({
    _id: opaqueMockFulfillmentMethodId,
    name: "mockMethod",
    label: "Standard mockMethod",
    handling: 9.5,
    rate: 90,
    cost: 9,
    isEnabled: true,
    fulfillmentTypes: ["shipping"],
    group: groups[0]
  });
});


