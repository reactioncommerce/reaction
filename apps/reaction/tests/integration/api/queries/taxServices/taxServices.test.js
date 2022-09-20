import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const TaxServicesQuery = importAsString("./TaxServicesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let testApp;
let taxServices;

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:taxes/read"],
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
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);

  taxServices = testApp.query(TaxServicesQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot view tax services", async () => {
  try {
    await taxServices({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("an admin user can view tax services", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await taxServices({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.taxServices[0].name).toBe("custom-rates");
  expect(result.taxServices[0].pluginName).toBe("taxes-flat-rate");
});
