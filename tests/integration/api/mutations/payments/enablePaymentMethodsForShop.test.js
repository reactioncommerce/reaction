import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const EnablePaymentMethodsForShopMutation = importAsString("./EnablePaymentMethodsForShopMutation.graphql");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shops/read", "reaction:legacy:shops/update"],
  slug: "admin",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

jest.setTimeout(300000);

let testApp;
let enablePaymentMethodsForShop;

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
  await testApp.setLoggedInUser(mockAdminAccount);

  enablePaymentMethodsForShop = await testApp.mutate(EnablePaymentMethodsForShopMutation);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an authorized user should be able to update the payment methods", async () => {
  let result;
  try {
    await testApp.setLoggedInUser(mockAdminAccount);
    result = await enablePaymentMethodsForShop({
      enablePaymentMethodForShopInput: {
        isEnabled: true,
        paymentMethodName: "iou_example",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  const updatedPaymentMethod = result.enablePaymentMethodForShop.paymentMethods.find((paymentMethod) => paymentMethod.name === "iou_example");
  expect(typeof updatedPaymentMethod).toEqual("object");
  expect(updatedPaymentMethod).toEqual({ isEnabled: true, name: "iou_example" });
});

test("an unauthorized user should not be able to update the payment methods", async () => {
  try {
    await enablePaymentMethodsForShop({
      enablePaymentMethodForShopInput: {
        isEnabled: true,
        paymentMethodName: "iou_example",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
