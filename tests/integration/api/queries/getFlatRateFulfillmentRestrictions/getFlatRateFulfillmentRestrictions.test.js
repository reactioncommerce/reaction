import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const FlatRateFulfillmentRestrictionsQuery = importAsString("./FlatRateFulfillmentRestrictionsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let getFlatRateFulfillmentRestrictions;
let testApp;

const mockFulfillmentRestriction = {
  _id: "5dee7c3a1286d3136bff3bb5",
  shopId: internalShopId,
  methodIds: [
    "6MugCf3Pn5rpfNke2"
  ],
  type: "allow",
  destination: {
    country: ["US"],
    postal: ["90817"],
    region: ["CA"]
  }
};

const mockOwenrAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["owner"]
  },
  shopId: internalShopId
});


beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.FlatRateFulfillmentRestrictions.insertOne(mockFulfillmentRestriction);
  await testApp.createUserAndAccount(mockOwenrAccount);
  getFlatRateFulfillmentRestrictions = testApp.query(FlatRateFulfillmentRestrictionsQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.FlatRateFulfillmentRestrictions.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("a shop owner can query for all flat rate fulfillment restrictions", async () => {
  let result;
  await testApp.setLoggedInUser(mockOwenrAccount);

  try {
    result = await getFlatRateFulfillmentRestrictions({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.getFlatRateFulfillmentRestrictions.nodes[0].destination.country[0]).toEqual("US");
});
