import TestApp from "../TestApp";
import CatalogItemProductFullQuery from "./CatalogItemProductFullQuery.graphql";

jest.setTimeout(300000);

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

const mockCatalogProductVariants = [
  {
    _id: internalVariantIds[0],
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isTaxable: true,
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
    options: [
      {
        _id: internalVariantIds[1],
        barcode: "barcode",
        createdAt,
        height: 2,
        index: 0,
        inventoryManagement: true,
        inventoryPolicy: true,
        isLowQuantity: true,
        isSoldOut: false,
        isTaxable: true,
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
        pricing: {
          USD: {
            compareAtPrice: 15,
            displayPrice: "992.00",
            maxPrice: 992.0,
            minPrice: 992.0,
            price: 992.0
          }
        },
        shopId: internalShopId,
        sku: "sku",
        taxCode: "0000",
        taxDescription: "taxDescription",
        title: "One pound bag",
        updatedAt: null,
        variantId: internalVariantIds[1],
        weight: 2,
        width: 2
      }
    ],
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    pricing: {
      USD: {
        compareAtPrice: 15,
        displayPrice: "992.00",
        maxPrice: 992.0,
        minPrice: 992.0,
        price: null
      }
    },
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt: updatedAt.toISOString(),
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  }
];

const mockCatalogProduct = {
  _id: internalCatalogProductId,
  barcode: "barcode",
  createdAt,
  description: "description",
  height: 11.23,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  isTaxable: false,
  isVisible: true,
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
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  pricing: {
    USD: {
      compareAtPrice: 15,
      displayPrice: "2.99 - 5.99",
      maxPrice: 5.99,
      minPrice: 2.99,
      price: null
    }
  },
  productId: internalProductId,
  media: [
    {
      toGrid: 1,
      priority: 1,
      productId: internalProductId,
      variantId: null,
      URLs: {
        thumbnail: "http://localhost/thumbnail",
        small: "http://localhost/small",
        medium: "http://localhost/medium",
        large: "http://localhost/large",
        original: "http://localhost/original"
      }
    }
  ],
  primaryImage: {
    toGrid: 1,
    priority: 1,
    productId: internalProductId,
    variantId: null,
    URLs: {
      thumbnail: "http://localhost/thumbnail",
      small: "http://localhost/small",
      medium: "http://localhost/medium",
      large: "http://localhost/large",
      original: "http://localhost/original"
    }
  },
  productType: "productType",
  requiresShipping: true,
  shopId: internalShopId,
  sku: "ABC123",
  slug: productSlug,
  socialMetadata: [
    { service: "twitter", message: "twitterMessage" },
    { service: "facebook", message: "facebookMessage" },
    { service: "googleplus", message: "googlePlusMessage" },
    { service: "pinterest", message: "pinterestMessage" }
  ],
  tagIds: internalTagIds,
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  title: "Fake Product Title",
  type: "product-simple",
  updatedAt: updatedAt.toISOString(),
  variants: mockCatalogProductVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const mockCatalogItem = {
  _id: internalCatalogItemId,
  product: mockCatalogProduct,
  shopId: internalShopId,
  createdAt,
  updatedAt
};

const expectedVariantsResponse = [
  {
    _id: opaqueCatalogVariantIds[0],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isTaxable: true,
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
    options: [
      {
        _id: opaqueCatalogVariantIds[1],
        barcode: "barcode",
        createdAt: createdAt.toISOString(),
        height: 2,
        index: 0,
        inventoryManagement: true,
        inventoryPolicy: true,
        isLowQuantity: true,
        isSoldOut: false,
        isTaxable: true,
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
        pricing: [
          {
            currency: {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
              code: "USD"
            },
            compareAtPrice: 15,
            displayPrice: "992.00",
            maxPrice: 992.0,
            minPrice: 992.0,
            price: 992.0
          }
        ],
        shop: {
          _id: opaqueShopId
        },
        sku: "sku",
        taxCode: "0000",
        taxDescription: "taxDescription",
        title: "One pound bag",
        updatedAt: null,
        variantId: opaqueVariantIds[1],
        weight: 2,
        width: 2
      }
    ],
    originCountry: "US",
    pricing: [
      {
        currency: {
          _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
          code: "USD"
        },
        compareAtPrice: 15,
        displayPrice: "992.00",
        maxPrice: 992.0,
        minPrice: 992.0,
        price: null
      }
    ],
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt: updatedAt.toISOString(),
    variantId: opaqueVariantIds[0],
    weight: 0,
    width: 0
  }
];

const expectedItemsResponse = {
  catalogItemProduct: {
    _id: opaqueCatalogItemId,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    shop: {
      _id: opaqueShopId
    },
    product: {
      _id: opaqueCatalogProductId,
      barcode: "barcode",
      createdAt: createdAt.toISOString(),
      description: "description",
      height: 11.23,
      isBackorder: false,
      isLowQuantity: false,
      isSoldOut: false,
      isTaxable: false,
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
      pricing: [
        {
          currency: {
            _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
            code: "USD"
          },
          compareAtPrice: 15,
          displayPrice: "2.99 - 5.99",
          maxPrice: 5.99,
          minPrice: 2.99,
          price: null
        }
      ],
      productId: opaqueProductId,
      media: [
        {
          toGrid: 1,
          priority: 1,
          productId: opaqueProductId,
          variantId: null,
          URLs: {
            thumbnail: "http://localhost/thumbnail",
            small: "http://localhost/small",
            medium: "http://localhost/medium",
            large: "http://localhost/large",
            original: "http://localhost/original"
          }
        }
      ],
      primaryImage: {
        toGrid: 1,
        priority: 1,
        productId: opaqueProductId,
        variantId: null,
        URLs: {
          thumbnail: "http://localhost/thumbnail",
          small: "http://localhost/small",
          medium: "http://localhost/medium",
          large: "http://localhost/large",
          original: "http://localhost/original"
        }
      },
      productType: "productType",
      requiresShipping: true,
      shop: {
        _id: opaqueShopId
      },
      sku: "ABC123",
      slug: productSlug,
      socialMetadata: [
        { service: "twitter", message: "twitterMessage" },
        { service: "facebook", message: "facebookMessage" },
        { service: "googleplus", message: "googlePlusMessage" },
        { service: "pinterest", message: "pinterestMessage" }
      ],
      tagIds: opaqueTagIds,
      tags: {
        nodes: [{ _id: opaqueTagIds[0] }, { _id: opaqueTagIds[1] }]
      },
      taxCode: "taxCode",
      taxDescription: "taxDescription",
      title: "Fake Product Title",
      updatedAt: updatedAt.toISOString(),
      variants: expectedVariantsResponse,
      vendor: "vendor",
      weight: 15.6,
      width: 8.4
    }
  }
};

let testApp;
let query;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogItemProductFullQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insert({ _id, shopId: internalShopId })));
  await testApp.collections.Catalog.insert(mockCatalogItem);
});

afterAll(async () => {
  await testApp.collections.Shops.remove({ _id: internalShopId });
  await testApp.collections.Catalog.remove({ _id: internalCatalogItemId });
  testApp.stop();
});

test("get a catalog product by slug", async () => {
  let result;
  try {
    result = await query({ slugOrId: productSlug });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(expectedItemsResponse);
});

test("get a catalog product by ID", async () => {
  let result;
  try {
    result = await query({ slugOrId: opaqueCatalogItemId });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(expectedItemsResponse);
});
