import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const updateProductVariantPricesMutation = importAsString("./updateProductVariantPricesMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalVariantIds = ["875", "874", "925"];

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"],
  type: "simple",
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant",
  compareAtPrice: 12.99,
  price: 10.99
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:products/update:prices"],
  slug: "admin",
  shopId: internalShopId
});

let testApp;
let updateProductVariantPrices;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  updateProductVariantPrices = testApp.mutate(updateProductVariantPricesMutation);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [adminGroup._id]
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

// Update a product variant
test("expect both product variant price fields (compareAtPrice, price) to be updated", async () => {
  let result;

  const updateProductVariantPricesInput = {
    variantId: encodeOpaqueId("reaction/product", internalVariantIds[0]),
    shopId: opaqueShopId,
    prices: {
      compareAtPrice: 75.99,
      price: 69.99
    }
  };

  try {
    result = await updateProductVariantPrices(updateProductVariantPricesInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProductVariantPrices.variant.compareAtPrice).toEqual(75.99);
  expect(result.updateProductVariantPrices.variant.price).toEqual(69.99);
});

// Update a product variant
test("expect only compareAtPrice to be updated, price to stay the same as after the last test (69.99)", async () => {
  let result;

  const updateProductVariantPricesInput = {
    variantId: encodeOpaqueId("reaction/product", internalVariantIds[0]),
    shopId: opaqueShopId,
    prices: {
      compareAtPrice: 55.99
    }
  };

  try {
    result = await updateProductVariantPrices(updateProductVariantPricesInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProductVariantPrices.variant.compareAtPrice).toEqual(55.99);
  expect(result.updateProductVariantPrices.variant.price).toEqual(69.99);
});

// Update a product variant
test("expect only price to be updated, compareAtPrice to stay the same as after the last test (55.99)", async () => {
  let result;

  const updateProductVariantPricesInput = {
    variantId: encodeOpaqueId("reaction/product", internalVariantIds[0]),
    shopId: opaqueShopId,
    prices: {
      price: 89.99
    }
  };

  try {
    result = await updateProductVariantPrices(updateProductVariantPricesInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProductVariantPrices.variant.compareAtPrice).toEqual(55.99);
  expect(result.updateProductVariantPrices.variant.price).toEqual(89.99);
});
