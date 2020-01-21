import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

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

let testApp;
let queryFulfillmentMethods;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  queryFulfillmentMethods = testApp.query(flatRateFulfillmentMethodsQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

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
