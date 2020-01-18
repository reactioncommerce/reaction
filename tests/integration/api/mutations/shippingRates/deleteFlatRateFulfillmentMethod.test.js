import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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
  isEnabled: true,
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
  testApp = new TestApp();
  await testApp.start();
  deleteFlatRateFulfillmentMethod = testApp.mutate(DeleteFlatRateFulfillmentMethodMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

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

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Shipping.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

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
    ...mockFulfillmentMethodData
  });
});


