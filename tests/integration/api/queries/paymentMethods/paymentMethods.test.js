import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const PaymentMethodsQuery = importAsString("./PaymentMethodsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let paymentMethods;
let testApp;

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shops/read"],
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

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName, PaymentMethods: ["iou_example"] });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  paymentMethods = testApp.query(PaymentMethodsQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot view all payment methods", async () => {
  try {
    await paymentMethods({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("a shop owner can view a full list of all payment methods", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;
  try {
    result = await paymentMethods({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.paymentMethods[0].name).toEqual("iou_example");
  expect(result.paymentMethods[0].isEnabled).toEqual(false);
  expect(result.paymentMethods[1].name).toEqual("stripe_card");
  expect(result.paymentMethods[1].isEnabled).toEqual(false);
});
