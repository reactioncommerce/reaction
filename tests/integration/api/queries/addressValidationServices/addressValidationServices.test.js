import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddressValidationServicesQuery = importAsString("./AddressValidationServicesQuery.graphql");

jest.setTimeout(300000);

const shopId = "123";
const shopName = "Test Shop";
let testApp;
let addressValidationServices;

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

  addressValidationServices = testApp.query(AddressValidationServicesQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("list available address validation services", async () => {
  let result;

  try {
    result = await addressValidationServices();
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.addressValidationServices[0].name).toEqual("test");
  expect(result.addressValidationServices[0].supportedCountryCodes[0]).toEqual("US");
});
