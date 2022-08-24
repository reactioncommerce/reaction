import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";

jest.setTimeout(300000);

const internalShopId = "123";
const shopName = "Test Shop";

let primaryShopQuery;
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
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  primaryShopQuery = testApp.query(`query {
    primaryShop {
        name
    }
  }`);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("get primaryShop, no auth necessary", async () => {
  const result = await primaryShopQuery();
  expect(result).toEqual({
    primaryShop: {
      name: shopName
    }
  });
});
