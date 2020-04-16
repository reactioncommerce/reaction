import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

jest.setTimeout(300000);

let shopQuery;
let shopId;
let testApp;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  shopId = await insertPrimaryShop(testApp.context);

  shopQuery = testApp.query(`query ($id: ID!) {
  shop(id: $id) {
    _id
    currency {
      code
    }
    description
    name
  }
}`);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("get shop, no auth necessary", async () => {
  const opaqueShopId = encodeOpaqueId("reaction/shop", shopId);
  const result = await shopQuery({ id: opaqueShopId });
  expect(result).toEqual({
    shop: {
      _id: opaqueShopId,
      currency: { code: "USD" },
      description: "mockDescription",
      name: "Primary Shop"
    }
  });
});
