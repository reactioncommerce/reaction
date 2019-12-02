import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const getFlatRateFulfillmentMethodsQuery = importAsString("./getFlatRateFulfillmentMethodsQuery.graphql");

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
let queryFulfillmentMethods;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  queryFulfillmentMethods = testApp.query(getFlatRateFulfillmentMethodsQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await Promise.all(fulfillmentMethodDocs.map((doc) => (
    testApp.collections.Shipping.insertOne(doc)
  )));

  await testApp.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["admin"] }
  });
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Shipping.deleteMany({});
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

test("expect a list of fulfillment methods", async () => {
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

  expect(result.getFlatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.getFlatRateFulfillmentMethods.nodes[0].label).toEqual("Standard 10");
  expect(result.getFlatRateFulfillmentMethods.nodes[9].label).toEqual("Standard 19");
});

test("expect a list of fulfillment methods on the second page", async () => {
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

  expect(result.getFlatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.getFlatRateFulfillmentMethods.nodes[0].label).toEqual("Priority 20");
  expect(result.getFlatRateFulfillmentMethods.nodes[9].label).toEqual("Priority 29");
});

test("expect a list of fulfillment methods on the third page", async () => {
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

  expect(result.getFlatRateFulfillmentMethods.nodes.length).toEqual(10);
  expect(result.getFlatRateFulfillmentMethods.nodes[0].label).toEqual("Next-Day 30");
  expect(result.getFlatRateFulfillmentMethods.nodes[9].label).toEqual("Next-Day 39");
});
