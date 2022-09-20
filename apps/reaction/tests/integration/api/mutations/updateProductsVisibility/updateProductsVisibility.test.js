import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const updateProductsVisibility = importAsString("./UpdateProductsVisibility.graphql");

jest.setTimeout(300000);

const shopId = "123";
const adminAccountId = "adminAccountId";
const adminGroupId = "adminGroupId";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId);
const productId1 = "p1";
const opaqueProductId1 = encodeOpaqueId("reaction/product", productId1);
const productId2 = "p2";
const opaqueProductId2 = encodeOpaqueId("reaction/product", productId2);
const shopName = "Test Shop";
let testApp;
let updateProductsVisibilityMutation;

const mockAdminGroup = Factory.Group.makeOne({
  _id: adminGroupId,
  permissions: ["reaction:legacy:products/update"],
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  _id: adminAccountId,
  groups: [adminGroupId],
  shopId
});

const mockProduct1 = Factory.Product.makeOne({
  _id: productId1,
  shopId,
  isVisible: true
});

const mockProduct2 = Factory.Product.makeOne({
  _id: productId2,
  isVisible: true,
  shopId
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
  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });
  await testApp.collections.Groups.insertOne(mockAdminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.collections.Products.insertOne(mockProduct1);
  await testApp.collections.Products.insertOne(mockProduct2);

  updateProductsVisibilityMutation = testApp.mutate(updateProductsVisibility);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user cannot update multiple product's visibility", async () => {
  try {
    await updateProductsVisibilityMutation({
      input: {
        shopId: opaqueShopId,
        productIds: [opaqueProductId1, opaqueProductId2],
        isVisible: true
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("An admin user should be allowed to update multiple product's visibility", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  // Verify products are initially visible.
  const mockProducts = await testApp.collections.Products.find({ shopId }).toArray();
  expect(mockProducts[0].isVisible).toEqual(true);
  expect(mockProducts[1].isVisible).toEqual(true);

  try {
    // Set products visibility
    result = await updateProductsVisibilityMutation({
      input: {
        shopId: opaqueShopId,
        productIds: [opaqueProductId1, opaqueProductId2],
        isVisible: false
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  // Verify products are initially invisible after update.
  const updatedProducts = await testApp.collections.Products.find({ shopId }).toArray();
  expect(updatedProducts[0].isVisible).toEqual(false);
  expect(updatedProducts[1].isVisible).toEqual(false);

  // Expect two products to have been updated
  expect(result.updateProductsVisibility.updatedCount).toEqual(2);
});
