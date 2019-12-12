import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const CatalogItemProductFullQuery = importAsString("./CatalogItemProductFullQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const internalTagIds = ["923", "924"];
const opaqueTagIds = ["cmVhY3Rpb24vdGFnOjkyMw==", "cmVhY3Rpb24vdGFnOjkyNA=="]; // reaction/tag
const shopName = "Test Shop";

const mockCatalogItem = {
  _id: "999",
  product: {
    _id: "999",
    barcode: "barcode",
    createdAt: "2018-04-16T15:34:28.043Z",
    description: "description",
    height: 11.23,
    isBackorder: false,
    isLowQuantity: false,
    isSoldOut: false,
    isVisible: true,
    length: 5.67,
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
    pricing: {
      USD: {
        compareAtPrice: 10,
        displayPrice: "2.99 - 5.99",
        maxPrice: 5.99,
        minPrice: 2.99,
        price: null
      }
    },
    productId: "999",
    media: [
      {
        priority: 1,
        productId: "999",
        variantId: null,
        URLs: {
          thumbnail: "/thumbnail",
          small: "/small",
          medium: "/medium",
          large: "/large",
          original: "/original"
        }
      }
    ],
    primaryImage: {
      priority: 1,
      productId: "999",
      variantId: null,
      URLs: {
        thumbnail: "/thumbnail",
        small: "/small",
        medium: "/medium",
        large: "/large",
        original: "/original"
      }
    },
    productType: "productType",
    shopId: "123",
    sku: "ABC123",
    slug: "fake-product",
    socialMetadata: [
      {
        service: "twitter",
        message: "twitterMessage"
      },
      {
        service: "facebook",
        message: "facebookMessage"
      },
      {
        service: "googleplus",
        message: "googlePlusMessage"
      },
      {
        service: "pinterest",
        message: "pinterestMessage"
      }
    ],
    supportedFulfillmentTypes: ["shipping"],
    tagIds: ["923", "924"],
    title: "Fake Product Title",
    type: "product-simple",
    updatedAt: "2018-04-17T15:34:28.043Z",
    variants: [
      {
        _id: "875",
        barcode: "barcode",
        createdAt: "2018-04-16T15:34:28.043Z",
        height: 0,
        index: 0,
        isTaxable: true,
        length: 0,
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
            _id: "874",
            barcode: "barcode",
            createdAt: null,
            height: 2,
            index: 0,
            isTaxable: true,
            length: 2,
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
            pricing: {
              USD: {
                compareAtPrice: null,
                displayPrice: "5.99",
                maxPrice: 5.99,
                minPrice: 5.99,
                price: 5.99
              }
            },
            shopId: "123",
            sku: "sku",
            taxCode: "0000",
            taxDescription: "taxDescription",
            title: "Two pound bag",
            updatedAt: null,
            variantId: "874",
            weight: 2,
            width: 2
          },
          {
            _id: "873",
            barcode: "barcode",
            createdAt: null,
            height: 2,
            index: 0,
            isTaxable: true,
            length: 2,
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
            optionTitle: "Another Awesome Soft Bike",
            originCountry: "US",
            pricing: {
              USD: {
                compareAtPrice: null,
                displayPrice: "2.99",
                maxPrice: 2.99,
                minPrice: 2.99,
                price: 2.99
              }
            },
            shopId: "123",
            sku: "sku",
            taxCode: "0000",
            taxDescription: "taxDescription",
            title: "One pound bag",
            updatedAt: null,
            variantId: "873",
            weight: 2,
            width: 2
          }
        ],
        optionTitle: "Untitled Option",
        originCountry: "US",
        pricing: {
          USD: {
            compareAtPrice: 10,
            displayPrice: "2.99 - 5.99",
            maxPrice: 5.99,
            minPrice: 2.99,
            price: null
          }
        },
        shopId: "123",
        sku: "sku",
        taxCode: "0000",
        taxDescription: "taxDescription",
        title: "Small Concrete Pizza",
        updatedAt: "2018-04-17T15:34:28.043Z",
        variantId: "875",
        weight: 0,
        width: 0
      }
    ],
    vendor: "vendor",
    weight: 15.6,
    width: 8.4
  },
  shopId: "123",
  createdAt: "2018-04-16T15:34:28.043Z",
  updatedAt: "2018-04-17T15:34:28.043Z"
};

const expectedItemsResponse = {
  catalogItemProduct: {
    _id: "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06OTk5",
    createdAt: "2018-04-16T15:34:28.043Z",
    updatedAt: "2018-04-17T15:34:28.043Z",
    shop: { _id: "cmVhY3Rpb24vc2hvcDoxMjM=" },
    product: {
      _id: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6OTk5",
      barcode: "barcode",
      createdAt: "2018-04-16T15:34:28.043Z",
      description: "description",
      height: 11.23,
      isBackorder: false,
      isLowQuantity: false,
      isSoldOut: false,
      length: 5.67,
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
      parcel: { containers: "containers", length: 4.44, width: 5.55, height: 6.66, weight: 7.77 },
      pricing: [
        {
          currency: { _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE", code: "USD" },
          compareAtPrice: { amount: 10 },
          displayPrice: "2.99 - 5.99",
          maxPrice: 5.99,
          minPrice: 2.99,
          price: null
        }
      ],
      productId: "cmVhY3Rpb24vcHJvZHVjdDo5OTk=",
      media: [
        {
          priority: 1,
          productId: "cmVhY3Rpb24vcHJvZHVjdDo5OTk=",
          variantId: null,
          URLs: {
            thumbnail: "https://shop.fake.site/thumbnail",
            small: "https://shop.fake.site/small",
            medium: "https://shop.fake.site/medium",
            large: "https://shop.fake.site/large",
            original: "https://shop.fake.site/original"
          }
        }
      ],
      primaryImage: {
        priority: 1,
        productId: "cmVhY3Rpb24vcHJvZHVjdDo5OTk=",
        variantId: null,
        URLs: {
          thumbnail: "https://shop.fake.site/thumbnail",
          small: "https://shop.fake.site/small",
          medium: "https://shop.fake.site/medium",
          large: "https://shop.fake.site/large",
          original: "https://shop.fake.site/original"
        }
      },
      productType: "productType",
      shop: { _id: "cmVhY3Rpb24vc2hvcDoxMjM=" },
      sku: "ABC123",
      slug: "fake-product",
      socialMetadata: [
        { service: "twitter", message: "twitterMessage" },
        { service: "facebook", message: "facebookMessage" },
        { service: "googleplus", message: "googlePlusMessage" },
        { service: "pinterest", message: "pinterestMessage" }
      ],
      supportedFulfillmentTypes: ["shipping"],
      tagIds: ["cmVhY3Rpb24vdGFnOjkyMw==", "cmVhY3Rpb24vdGFnOjkyNA=="],
      tags: { nodes: [{ _id: "cmVhY3Rpb24vdGFnOjkyMw==" }, { _id: "cmVhY3Rpb24vdGFnOjkyNA==" }] },
      title: "Fake Product Title",
      updatedAt: "2018-04-17T15:34:28.043Z",
      variants: [
        {
          _id: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NQ==",
          barcode: "barcode",
          createdAt: "2018-04-16T15:34:28.043Z",
          height: 0,
          index: 0,
          isLowQuantity: false,
          isSoldOut: true,
          isTaxable: true,
          length: 0,
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
              _id: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NA==",
              barcode: "barcode",
              createdAt: null,
              height: 2,
              index: 0,
              isLowQuantity: false,
              isSoldOut: false,
              isTaxable: true,
              length: 2,
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
                  currency: { _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE", code: "USD" },
                  compareAtPrice: null,
                  displayPrice: "5.99",
                  maxPrice: 5.99,
                  minPrice: 5.99,
                  price: 5.99
                }
              ],
              shop: { _id: "cmVhY3Rpb24vc2hvcDoxMjM=" },
              sku: "sku",
              taxCode: "0000",
              taxDescription: "taxDescription",
              title: "Two pound bag",
              updatedAt: null,
              variantId: "cmVhY3Rpb24vcHJvZHVjdDo4NzQ=",
              weight: 2,
              width: 2
            },
            {
              _id: "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3Mw==",
              barcode: "barcode",
              createdAt: null,
              height: 2,
              index: 0,
              isLowQuantity: false,
              isSoldOut: false,
              isTaxable: true,
              length: 2,
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
              optionTitle: "Another Awesome Soft Bike",
              originCountry: "US",
              pricing: [
                {
                  currency: { _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE", code: "USD" },
                  compareAtPrice: null,
                  displayPrice: "2.99",
                  maxPrice: 2.99,
                  minPrice: 2.99,
                  price: 2.99
                }
              ],
              shop: { _id: "cmVhY3Rpb24vc2hvcDoxMjM=" },
              sku: "sku",
              taxCode: "0000",
              taxDescription: "taxDescription",
              title: "One pound bag",
              updatedAt: null,
              variantId: "cmVhY3Rpb24vcHJvZHVjdDo4NzM=",
              weight: 2,
              width: 2
            }
          ],
          originCountry: "US",
          pricing: [
            {
              currency: { _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE", code: "USD" },
              compareAtPrice: { amount: 10 },
              displayPrice: "2.99 - 5.99",
              maxPrice: 5.99,
              minPrice: 2.99,
              price: null
            }
          ],
          shop: { _id: "cmVhY3Rpb24vc2hvcDoxMjM=" },
          sku: "sku",
          taxCode: "0000",
          taxDescription: "taxDescription",
          title: "Small Concrete Pizza",
          updatedAt: "2018-04-17T15:34:28.043Z",
          variantId: "cmVhY3Rpb24vcHJvZHVjdDo4NzU=",
          weight: 0,
          width: 0
        }
      ],
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
  await Promise.all(
    internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` }))
  );
  await testApp.collections.Catalog.insertOne(mockCatalogItem);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteMany({ _id: { $in: internalTagIds } });
  await testApp.collections.Catalog.deleteOne({ _id: mockCatalogItem._id });
  await testApp.stop();
});

test("get a catalog product by slug", async () => {
  let result;
  try {
    result = await query({ slugOrId: mockCatalogItem.product.slug });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual(expectedItemsResponse);
});

test("get a catalog product by ID", async () => {
  let result;
  try {
    result = await query({ slugOrId: encodeOpaqueId("reaction/catalogItem", mockCatalogItem._id) });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(expectedItemsResponse);
});
