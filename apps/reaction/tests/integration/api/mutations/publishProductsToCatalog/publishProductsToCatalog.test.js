import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const PublishProductToCatalogMutation = importAsString("./PublishProductsToCatalogMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874", "925"];

const opaqueCatalogVariantIds = [
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NQ==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NA==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50OjkyNQ=="
]; // reaction/catalogProductVariant

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"]
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockOptionTwo = {
  _id: internalVariantIds[2],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option Two",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockCatalogItem = {
  product: {
    productId: opaqueProductId,
    title: "Fake Product",
    isDeleted: false,
    supportedFulfillmentTypes: ["shipping"],
    variants: [
      {
        _id: opaqueCatalogVariantIds[0],
        title: "Fake Product Variant",
        options: [
          {
            _id: opaqueCatalogVariantIds[1],
            title: "Fake Product Option One"
          },
          {
            _id: opaqueCatalogVariantIds[2],
            title: "Fake Product Option Two"
          }
        ]
      }
    ]
  }
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:products/publish"],
  slug: "admin",
  shopId: internalShopId
});

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  mutate = testApp.mutate(PublishProductToCatalogMutation);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockOptionOne);
  await testApp.collections.Products.insertOne(mockOptionTwo);
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

// publish new product to catalog
test("expect a CatalogItemProduct when a Product is published to the Catalog collection", async () => {
  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});

// publish product updates to catalog
test("expect an updated CatalogItemProduct when a Product is updated and republished to the Catalog", async () => {
  const updatedTitle = "Really Fake Product";
  await testApp.collections.Products.updateOne(
    {
      _id: internalProductId
    },
    {
      $set: {
        title: updatedTitle
      }
    }
  );

  mockCatalogItem.product.title = updatedTitle;

  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});

// publish product variant updates to catalog
test("expect an updated CatalogItemProduct when a Product Variant is updated and republished to the Catalog", async () => {
  const updatedTitle = "Really Fake Product Variant";
  await testApp.collections.Products.updateOne(
    {
      _id: internalVariantIds[0]
    },
    {
      $set: {
        title: updatedTitle
      }
    }
  );

  mockCatalogItem.product.variants[0].title = updatedTitle;

  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});

// publish product variant option updates to catalog
test("expect an updated CatalogItemProduct when a Product Variant Option is updated and republished to the Catalog", async () => {
  const updatedTitle = "Really Fake Product Option";
  await testApp.collections.Products.updateOne(
    {
      _id: internalVariantIds[1]
    },
    {
      $set: {
        title: updatedTitle
      }
    }
  );

  mockCatalogItem.product.variants[0].options[0].title = updatedTitle;

  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});

// publish deleted product option to catalog
test("expect an updated CatalogItemProduct when a Product is marked as deleted and republished to the Catalog", async () => {
  await testApp.collections.Products.updateOne(
    {
      _id: internalVariantIds[2]
    },
    {
      $set: {
        isDeleted: true
      }
    }
  );

  mockCatalogItem.product.variants[0].options = [mockCatalogItem.product.variants[0].options[0]];

  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});

// publish deleted product to catalog
test("expect an updated CatalogItemProduct when a Product is marked as deleted and republished to the Catalog", async () => {
  await testApp.collections.Products.updateOne(
    {
      _id: internalProductId
    },
    {
      $set: {
        isDeleted: true
      }
    }
  );

  mockCatalogItem.product.isDeleted = true;

  let result;
  try {
    result = await mutate({ productIds: [opaqueProductId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ publishProductsToCatalog: [mockCatalogItem] });
});
