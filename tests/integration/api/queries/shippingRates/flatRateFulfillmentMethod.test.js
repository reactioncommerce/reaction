import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const flatRateFulfillmentMethodQuery = importAsString("./flatRateFulfillmentMethodQuery.graphql");

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

let testApp;
let queryFulfillmentMethod;

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: []
  },
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["reaction:legacy:shippingMethods/read"]
  },
  shopId: internalShopId
});

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  queryFulfillmentMethod = testApp.query(flatRateFulfillmentMethodQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await Promise.all(fulfillmentMethodDocs.map((doc) => (
    testApp.collections.Shipping.insertOne(doc)
  )));
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("expect a fulfillment method", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  let result;

  try {
    result = await queryFulfillmentMethod({
      methodId: encodeOpaqueId("reaction/fulfillmentMethod", "method-11"),
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.flatRateFulfillmentMethod.label).toEqual("Standard 11");
});

test("throws access-denied when getting a fulfillment method if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await queryFulfillmentMethod({
      methodId: encodeOpaqueId("reaction/fulfillmentMethod", "method-35"),
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
    return;
  }
});
