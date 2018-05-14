import GraphTester from "../GraphTester";
import PublishProductToCatalogMutation from "./PublishProductsToCatalogMutation.graphql";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

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
  isVisible: true
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockOptionTwo = {
  _id: internalVariantIds[2],
  ancestors: [internalProductId, internalVariantIds[0]],
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

let tester;
let mutate;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.start();
  mutate = tester.mutate(PublishProductToCatalogMutation);
  await tester.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => tester.collections.Tags.insert({ _id, shopId: internalShopId })));
  await tester.collections.Products.insert(mockProduct);
  await tester.collections.Products.insert(mockVariant);
  await tester.collections.Products.insert(mockOptionOne);
  await tester.collections.Products.insert(mockOptionTwo);
  await tester.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["createProduct"] }
  });
});

afterAll(async () => {
  await tester.collections.Shops.remove({ _id: internalShopId });
  await tester.collections.Product.remove({ _id: internalProductId });
  await tester.collections.Product.remove({ _id: internalVariantIds[0] });
  await tester.collections.Product.remove({ _id: internalVariantIds[1] });
  await tester.collections.Product.remove({ _id: internalVariantIds[2] });
  await tester.clearLoggedInUser();
  tester.stop();
});

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
  await tester.collections.Products.updateOne(
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
  await tester.collections.Products.updateOne(
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
  await tester.collections.Products.updateOne(
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
  await tester.collections.Products.updateOne(
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
  await tester.collections.Products.updateOne(
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
