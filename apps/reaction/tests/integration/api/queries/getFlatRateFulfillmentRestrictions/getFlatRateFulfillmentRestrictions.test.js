import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

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
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.FlatRateFulfillmentRestrictions.insertOne(mockFulfillmentRestriction);
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  getFlatRateFulfillmentRestrictions = testApp.query(FlatRateFulfillmentRestrictionsQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("a shop owner can query for all flat rate fulfillment restrictions", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

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
