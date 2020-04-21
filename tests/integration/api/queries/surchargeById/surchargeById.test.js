import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const SurchargeByIdQuery = importAsString("./SurchargeByIdQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalSurchargeId = "456";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const opaqueSurchargeId = encodeOpaqueId("reaction/surcharge", internalSurchargeId); // reaction/surcharge:456
const shopName = "Test Shop";
let testApp;
let surchargeById;

const mockSurcharge = Factory.Surcharge.makeOne({
  _id: internalSurchargeId,
  shopId: internalShopId,
  amount: 20
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
  await testApp.collections.Surcharges.insertOne(mockSurcharge);
  surchargeById = testApp.query(SurchargeByIdQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("retrieve a surcharge by its id", async () => {
  let result;

  try {
    result = await surchargeById({
      shopId: opaqueShopId,
      surchargeId: opaqueSurchargeId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.surchargeById.amount.amount).toEqual(20);
});
