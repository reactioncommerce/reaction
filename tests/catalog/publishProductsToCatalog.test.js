import GraphTester from "../GraphTester";
import PublishProductToCatalogMutation from "./PublishProductsToCatalogMutation.graphql";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const opaqueCatalogItemId = "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06OTk5"; // reaction/catalogItem:999
const internalCatalogProductId = "999";
const opaqueCatalogProductId = "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6OTk5"; // reaction/catalogProduct:999
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
const internalTagIds = ["923", "924"];
const opaqueTagIds = ["cmVhY3Rpb24vdGFnOjkyMw==", "cmVhY3Rpb24vdGFnOjkyNA=="]; // reaction/tag
const internalVariantIds = ["875", "874"];
const opaqueVariantIds = ["cmVhY3Rpb24vcHJvZHVjdDo4NzU=", "cmVhY3Rpb24vcHJvZHVjdDo4NzQ="]; // reaction/product
const opaqueCatalogVariantIds = [
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NQ==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NA=="
]; // reaction/catalogProductVariant

const productSlug = "fake-product";
const shopName = "Test Shop";

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");
const positionUpdatedAt = new Date("2018-04-15T15:34:28.043Z");

const mockVariants = [
  {
    _id: internalVariantIds[0],
    ancestors: [internalCatalogProductId],
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  {
    _id: internalVariantIds[1],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    barcode: "barcode",
    height: 2,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: true,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 2,
    lowInventoryWarningThreshold: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Awesome Soft Bike",
    originCountry: "US",
    price: 992.0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

const mockProduct = {
  _id: internalProductId,
  shopId: internalShopId,
  barcode: "barcode",
  createdAt,
  description: "description",
  facebookMsg: "facebookMessage",
  fulfillmentService: "fulfillmentService",
  googleplusMsg: "googlePlusMessage",
  height: 11.23,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
  metafields: [
    {
      value: "value",
      namespace: "namespace",
      description: "description",
      valueType: "valueType",
      scope: "scope",
      key: "key"
    }
  ],
  metaDescription: "metaDescription",
  minOrderQuantity: 5,
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    length: 4.44,
    width: 5.55,
    height: 6.66,
    weight: 7.77
  },
  pinterestMsg: "pinterestMessage",
  positions: {
    [shopName.toLowerCase()]: {
      weight: 1,
      position: 1,
      pinned: true,
      updatedAt: positionUpdatedAt.toISOString()
    }
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  media: [
    {
      metadata: {
        toGrid: 1,
        priority: 1,
        productId: internalProductId,
        variantId: null
      },
      thumbnail: "http://localhost/thumbnail",
      small: "http://localhost/small",
      medium: "http://localhost/medium",
      large: "http://localhost/large",
      image: "http://localhost/original"
    }
  ],
  productId: internalProductId,
  productType: "productType",
  requiresShipping: true,
  shop: {
    _id: opaqueShopId
  },
  sku: "ABC123",
  handle: productSlug,
  hashtags: internalTagIds,
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  taxable: false,
  title: "Fake Product Title",
  twitterMsg: "twitterMessage",
  type: "product-simple",
  updatedAt,
  mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const mockCatalogItem = {
  product: {
    productId: opaqueProductId,
    title: "Fake Product Title",
    isDeleted: false
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
  await tester.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["createProduct"] }
  });
});

afterAll(async () => {
  await tester.collections.Shops.remove({ _id: internalShopId });
  await tester.collections.Product.remove({ _id: internalProductId });
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
  const updatedProductTitle = "Really Fake Product Title";
  await tester.collections.Products.updateOne(
    {
      _id: internalProductId
    },
    {
      $set: {
        title: updatedProductTitle
      }
    }
  );

  mockCatalogItem.product.title = updatedProductTitle;

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
test("expect an updated CatalogItemProduct when a Product is marked as delted and republished to the Catalog", async () => {
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
