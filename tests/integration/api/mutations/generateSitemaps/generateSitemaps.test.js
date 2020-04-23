import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const GenerateSitemapsMutation = importAsString("./generateSitemaps.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const shopName = "Test Shop";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shops/update"],
  slug: "admin",
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId
});

let testApp;
let generateSitemaps;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  generateSitemaps = testApp.mutate(GenerateSitemapsMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("generate sitemaps", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  try {
    result = await generateSitemaps({
      input: {
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const createdJob = await testApp.collections.Jobs.findOne({
    "type": "sitemaps/generate",
    "data.shopId": shopId
  });

  expect(createdJob.data.shopId).toEqual(shopId);
  expect(result.generateSitemaps.wasJobScheduled).toEqual(true);
});
