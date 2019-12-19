import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const UpdateFlatRateFulfillmentMethodMutation = importAsString("./UpdateFlatRateFulfillmentMethodMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const groups = ["Standard", "Priority", "Next-Day"];

const mockShippingMethod = {
  name: "mockMethod",
  label: `${groups[0]} mockMethod`,
  handling: 9.5,
  rate: 90,
  cost: 9,
  isEnabled: true,
  fulfillmentTypes: ["shipping"],
  group: groups[0]
};

const mockShippingMethodId = "mockMethod";
const opaqueMockShippingMethodId = encodeOpaqueId("reaction/fulfillmentMethod", mockShippingMethodId);

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: []
  },
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["owner", "admin", "shipping"]
  },
  shopId: internalShopId
});

let testApp;
let updateFlatRateFulfillmentMethod;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  updateFlatRateFulfillmentMethod = testApp.mutate(UpdateFlatRateFulfillmentMethodMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await testApp.collections.Shipping.insertOne({
    methods: [{
      _id: mockShippingMethodId,
      shopId: internalShopId,
      ...mockShippingMethod
    }],
    shopId: internalShopId
  });
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Shipping.deleteMany({});
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("user can not update flat rate fulfillment method if admin is not logged in", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await updateFlatRateFulfillmentMethod({
      input: {
        methodId: opaqueMockShippingMethodId,
        shopId: opaqueShopId,
        method: {
          ...mockShippingMethod,
          label: `${groups[1]} mockMethod`,
          group: groups[1]
        }
      }
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("user can update flat rate fulfillment method if admin is logged in", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await updateFlatRateFulfillmentMethod({
      input: {
        methodId: opaqueMockShippingMethodId,
        shopId: opaqueShopId,
        method: {
          ...mockShippingMethod,
          label: `${groups[1]} mockMethod`,
          group: groups[1]
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateFlatRateFulfillmentMethod.method).toEqual({
    ...mockShippingMethod,
    _id: opaqueMockShippingMethodId,
    label: `${groups[1]} mockMethod`,
    group: groups[1]
  });
});


