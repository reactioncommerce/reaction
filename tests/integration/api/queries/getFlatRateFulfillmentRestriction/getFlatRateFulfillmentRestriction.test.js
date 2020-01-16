import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const FlatRateFulfillmentRestrictionQuery = importAsString("./FlatRateFulfillmentRestrictionQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalRestrictionId = "456";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const opaqueRestrictionId = encodeOpaqueId("reaction/flatRateFulfillmentRestriction", internalRestrictionId);
const shopName = "Test Shop";
let getFlatRateFulfillmentRestriction;
let testApp;

const mockFulfillmentRestriction = {
  _id: internalRestrictionId,
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

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shippingRestrictions/read"],
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
  await testApp.collections.FlatRateFulfillmentRestrictions.insertOne(mockFulfillmentRestriction);
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  getFlatRateFulfillmentRestriction = testApp.query(FlatRateFulfillmentRestrictionQuery);
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.collections.FlatRateFulfillmentRestrictions.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Groups.deleteMany({});
  await testApp.stop();
});

test("a shop owner can query for a flat rate fulfillment restriction", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await getFlatRateFulfillmentRestriction({
      shopId: opaqueShopId,
      restrictionId: opaqueRestrictionId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.getFlatRateFulfillmentRestriction.destination.country[0]).toEqual("US");
});
