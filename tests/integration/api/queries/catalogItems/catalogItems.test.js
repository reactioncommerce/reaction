import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CatalogProductItemsFullQuery = importAsString("./CatalogProductItemsFullQuery.graphql");
const CatalogProductItemsFullQueryPaginated = importAsString("./CatalogProductItemsFullQueryPaginated.graphql");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTag = Factory.Tag.makeOne({
  featuredProductIds: [
    "501",
    "503",
    "505",
    "506",
    "504",
    "500",
    "501",
    "502",
    "507",
    "508",
    "509",
    "512",
    "511",
    "513",
    "510",
    "506",
    "514"
  ],
  shopId: internalShopId,
  slug: "2"
});

const mockCatalogItems = Factory.Catalog.makeMany(15, {
  _id: (iterator) => (iterator + 500).toString(),
  product: (iterator) =>
    Factory.CatalogProduct.makeOne({
      _id: (iterator + 500).toString(),
      productId: (iterator + 500).toString(),
      isDeleted: false,
      isVisible: true,
      tagIds: [mockTag._id],
      shopId: internalShopId,
      pricing: {
        USD: {
          compareAtPrice: 6.0 + (iterator + 10),
          displayPrice: `${0.99 + iterator} - ${1.99 + iterator}`,
          maxPrice: 1.99 + iterator,
          minPrice: 0.99 + iterator,
          price: null
        }
      },
      media: [
        {
          priority: 1,
          productId: (iterator + 500).toString(),
          variantId: null,
          URLs: { thumbnail: "/thumbnail", small: "/small", medium: "/medium", large: "/large", original: "/original" }
        }
      ],
      socialMetadata: [
        { service: "twitter", message: "twitterMessage" },
        { service: "facebook", message: "facebookMessage" },
        { service: "googleplus", message: "googlePlusMessage" },
        { service: "pinterest", message: "pinterestMessage" }
      ],
      variants: Factory.CatalogProductVariant.makeMany(1, {
        options: null,
        shopId: internalShopId,
        pricing: {
          USD: {
            compareAtPrice: 6.0 + (iterator + 10),
            displayPrice: `${0.99 + iterator} - ${1.99 + iterator}`,
            maxPrice: 1.99 + iterator,
            minPrice: 0.99 + iterator,
            price: null
          }
        }
      })
    }),
  shopId: internalShopId
});

const opaqueCatalogItemIds = mockCatalogItems.map((item) => encodeOpaqueId("reaction/catalogProduct", item._id));

jest.setTimeout(300000);

let testApp;
let query;
let paginatedQuery;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogProductItemsFullQuery);
  paginatedQuery = testApp.query(CatalogProductItemsFullQueryPaginated);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Tags.insertOne(mockTag);
  await Promise.all(mockCatalogItems.map((mockItem) => testApp.collections.Catalog.insertOne(mockItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTag._id });
  await Promise.all(mockCatalogItems.map((mockItem) => testApp.collections.Catalog.deleteOne({ _id: mockItem._id })));
  await testApp.stop();
});

test("get all items for shop", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.nodes.length).toEqual(15);

  result.catalogItems.nodes.forEach(({ product }) => {
    expect(opaqueCatalogItemIds).toContain(product._id);
  });
});

// expect CatalogItems sorted by minPrice form high to low
test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId], sortBy: "minPrice", sortByPriceCurrencyCode: "USD" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const firstCatalogItem = mockCatalogItems[0];
  const lastCatalogItem = mockCatalogItems[mockCatalogItems.length - 1];

  const firstResultItem = result.catalogItems.nodes[0];
  const lastResultItem = result.catalogItems.nodes[result.catalogItems.nodes.length - 1];

  const resultProductIds = result.catalogItems.nodes.map((node) => node.product._id);

  expect(result.catalogItems.nodes.length).toEqual(15);

  expect(firstResultItem.product.pricing[0].minPrice).toEqual(lastCatalogItem.product.pricing.USD.minPrice);
  expect(firstResultItem.product._id).toEqual(opaqueCatalogItemIds[opaqueCatalogItemIds.length - 1]);

  expect(lastResultItem.product.pricing[0].minPrice).toEqual(firstCatalogItem.product.pricing.USD.minPrice);
  expect(lastResultItem.product._id).toEqual(opaqueCatalogItemIds[0]);
  expect(resultProductIds).toEqual(opaqueCatalogItemIds.reverse());
});

test("expect CatalogItemProducts with offset 0 to return all items", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 0
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.pageInfo.hasNextPage).toBe(false);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(false);
  expect(result.catalogItems.totalCount).toBe(15);
  expect(result.catalogItems.nodes.length).toBe(15);
});

// expect CatalogItems with offset to skip items
test("expect CatalogitemProducts with offset to skip items", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 1
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.pageInfo.hasNextPage).toBe(false);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(true);
  expect(result.catalogItems.nodes.length).toBe(14);
});

// expect CatalogItems with feature sortBy and offset to skip items correctly
test("expect CatalogitemProducts with offset and featured sort to skip items", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 1,
      sortBy: "featured",
      tagIds: [encodeOpaqueId("reaction/tag", mockTag._id)]
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.pageInfo.hasNextPage).toBe(false);
  // @TODO: debug this
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(true);
  expect(result.catalogItems.nodes.length).toBe(1);
});

// expect CatalogItems sorted by minPrice form high to low when sortOrder is desc
test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided and sortOrder is desc", async () => {
  let result;
  try {
    result = await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice",
      sortByPriceCurrencyCode: "USD",
      sortOrder: "desc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const resultProductIds = result.catalogItems.nodes.map((node) => node.product._id);

  expect(resultProductIds).toEqual(opaqueCatalogItemIds);
});

// expect CatalogItems sorted by minPrice form low to high when sortOrder is asc
test("expect CatalogItemProducts sorted by minPrice from lowest to highest when sortByPriceCurrencyCode is provided and sortOrder is asc", async () => {
  let result;
  try {
    result = await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice",
      sortByPriceCurrencyCode: "USD",
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const resultProductIds = result.catalogItems.nodes.map((node) => node.product._id);

  expect(resultProductIds).toEqual(opaqueCatalogItemIds.reverse());
});

// expect error when invalid currency code is provided
test("expect error when sortByPriceCurrencyCode is not provided while sortBy is minPrice", async () => {
  try {
    await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice"
    });
  } catch (error) {
    expect(error[0].message).toMatchSnapshot();
  }
});
