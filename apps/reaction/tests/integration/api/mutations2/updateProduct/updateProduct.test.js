import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const updateProductMutation = importAsString("./updateProductMutation.graphql");
const updateProductVariantMutation = importAsString("./updateProductVariantMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
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
  type: "variant"
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant"
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:products/update"],
  slug: "admin",
  shopId: internalShopId
});

let testApp;
let updateProduct;
let updateVariant;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  updateProduct = testApp.mutate(updateProductMutation);
  updateVariant = testApp.mutate(updateProductVariantMutation);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockOptionOne);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [adminGroup._id]
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

// Update fields on a product
test("expect product fields to be updated", async () => {
  let result;

  const updateProductInput = {
    productId: opaqueProductId,
    shopId: opaqueShopId,
    product: {
      title: "Updated product title",
      metafields: [
        { key: "size", value: "small" },
        { key: "pattern", value: "striped" }
      ],
      twitterMsg: "Shop all new products"
    }
  };

  try {
    result = await updateProduct(updateProductInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProduct.product.title).toEqual("Updated product title");
  expect(result.updateProduct.product.metafields).toEqual([
    { key: "size", value: "small" },
    { key: "pattern", value: "striped" }
  ]);
  expect(result.updateProduct.product.socialMetadata).toEqual([
    {
      message: "",
      service: "facebook"
    },
    {
      message: "",
      service: "googleplus"
    },
    {
      message: "",
      service: "pinterest"
    },
    {
      message: "Shop all new products",
      service: "twitter"
    }
  ]);
});

test("expect product to be not visible", async () => {
  let result;

  const updateProductInput = {
    productId: opaqueProductId,
    shopId: opaqueShopId,
    product: {
      isVisible: false
    }
  };

  try {
    result = await updateProduct(updateProductInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProduct.product.isVisible).toEqual(false);
});

// Update a product variant
test("expect product variant fields to be updated", async () => {
  let result;

  const updateProductVariantInput = {
    variantId: encodeOpaqueId("reaction/product", internalVariantIds[0]),
    shopId: opaqueShopId,
    variant: {
      title: "Updated variant title",
      attributeLabel: "color",
      isTaxable: true,
      taxCode: "1234",
      taxDescription: "tax description",
      metafields: [
        { key: "size", value: "small" },
        { key: "pattern", value: "striped" }
      ]
    }
  };

  try {
    result = await updateVariant(updateProductVariantInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateProductVariant.variant.title).toEqual("Updated variant title");
  expect(result.updateProductVariant.variant.attributeLabel).toEqual("color");
  expect(result.updateProductVariant.variant.isTaxable).toEqual(true);
  expect(result.updateProductVariant.variant.taxCode).toEqual("1234");
  expect(result.updateProductVariant.variant.taxDescription).toEqual("tax description");
  expect(result.updateProductVariant.variant.metafields).toEqual([
    { key: "size", value: "small" },
    { key: "pattern", value: "striped" }
  ]);
});
