import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const productsQuery = importAsString("./productsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const productDocuments = [];
const shopName = "Test Shop";

for (let index = 100; index < 136; index += 1) {
  const productId = `product-${index}`;
  const variantId = `variant-${index}`;
  const optionId = `option-${index}`;

  const mockProduct = {
    _id: productId,
    ancestors: [],
    hashtags: [
      `tag-${index}-0`,
      `tag-${index}-1`,
      `tag-${index}-2`
    ],
    title: `Fake Product ${index}`,
    shopId: internalShopId,
    isDeleted: false,
    isVisible: true,
    price: {
      min: index,
      max: index + 50,
      range: `${index} - ${index + 50}`
    },
    weight: {
      min: index,
      max: index + 10
    },
    metafields: [
      { key: "index", value: `${index}` }
    ],
    supportedFulfillmentTypes: ["shipping"],
    type: "simple",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockVariant = {
    _id: variantId,
    ancestors: [productId],
    attributeLabel: "Variant",
    title: `Fake Product Variant ${index}`,
    shopId: internalShopId,
    isDeleted: false,
    isVisible: true,
    type: "variant"
  };

  const mockOption = {
    _id: optionId,
    ancestors: [productId, variantId],
    attributeLabel: "Option",
    title: `Fake Product Option ${index}`,
    shopId: internalShopId,
    isDeleted: false,
    isVisible: true,
    type: "variant"
  };

  productDocuments.push(mockProduct);
  productDocuments.push(mockVariant);
  productDocuments.push(mockOption);
}

const userGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["reaction:legacy:products/read"],
  slug: "customer",
  shopId: internalShopId
});

let testApp;
let queryProducts;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  queryProducts = testApp.query(productsQuery);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  await testApp.collections.Groups.insertOne(userGroup);

  await Promise.all(productDocuments.map((doc) => (
    testApp.collections.Products.insertOne(doc)
  )));

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [userGroup._id]
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("default sort is by createdAt descending", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      first: 1
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes[0].title).toEqual("Fake Product 135");
});

test("expect a list of products", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      first: 10,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(10);
  expect(result.products.nodes[0].title).toEqual("Fake Product 100");
  expect(result.products.nodes[0].variants[0].title).toEqual("Fake Product Variant 100");
  expect(result.products.nodes[0].variants[0].options[0].title).toEqual("Fake Product Option 100");

  expect(result.products.nodes[9].title).toEqual("Fake Product 109");
  expect(result.products.nodes[9].variants[0].title).toEqual("Fake Product Variant 109");
  expect(result.products.nodes[9].variants[0].options[0].title).toEqual("Fake Product Option 109");
});

test("expect a list of products on the second page", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      first: 10,
      offset: 10,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(10);
  expect(result.products.nodes[0].title).toEqual("Fake Product 110");
  expect(result.products.nodes[0].variants[0].title).toEqual("Fake Product Variant 110");
  expect(result.products.nodes[0].variants[0].options[0].title).toEqual("Fake Product Option 110");

  expect(result.products.nodes[9].title).toEqual("Fake Product 119");
  expect(result.products.nodes[9].variants[0].title).toEqual("Fake Product Variant 119");
  expect(result.products.nodes[9].variants[0].options[0].title).toEqual("Fake Product Option 119");
});

test("expect a list of products filtered by product ids", async () => {
  const productId1 = encodeOpaqueId("reaction/product", "product-100");
  const productId2 = encodeOpaqueId("reaction/product", "product-110");
  const productId3 = encodeOpaqueId("reaction/product", "product-119");
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      productIds: [productId1, productId2, productId3],
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(3);
  expect(result.products.nodes[0]._id).toEqual(productId1);
  expect(result.products.nodes[1]._id).toEqual(productId2);
  expect(result.products.nodes[2]._id).toEqual(productId3);
});

test("expect a list of products filtered by a minimum price", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      priceMin: 132,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(4);
  expect(result.products.nodes[0].price.max).toEqual(182);
  expect(result.products.nodes[3].price.max).toEqual(185);
});

test("expect a list of products filtered by a maximum price", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      priceMax: 151,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(2);
  expect(result.products.nodes[0].price.max).toEqual(150);
  expect(result.products.nodes[1].price.max).toEqual(151);
});

test("expect a list of products filtered by a price range", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      priceMin: 110,
      priceMax: 163,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(4);
  expect(result.products.nodes[0].price.min).toEqual(110);
  expect(result.products.nodes[0].price.max).toEqual(160);
  expect(result.products.nodes[3].price.min).toEqual(113);
  expect(result.products.nodes[3].price.max).toEqual(163);
});

test("expect a list of products filtered by tags", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      tagIds: [
        encodeOpaqueId("reaction/tag", "tag-100-0"),
        encodeOpaqueId("reaction/tag", "tag-120-2"),
        encodeOpaqueId("reaction/tag", "tag-130-1"),
        encodeOpaqueId("reaction/tag", "tag-110-0")
      ],
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(4);
  expect(result.products.nodes[0].title).toEqual("Fake Product 100");
  expect(result.products.nodes[1].title).toEqual("Fake Product 110");
  expect(result.products.nodes[2].title).toEqual("Fake Product 120");
  expect(result.products.nodes[3].title).toEqual("Fake Product 130");
});

test("expect a list of products filtered by a metafield", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      metafieldKey: "index",
      metafieldValue: "110",
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(1);
  expect(result.products.nodes[0].title).toEqual("Fake Product 110");
});

test("expect a single of product filtered by a search query", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      query: "Fake Product 130",
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(1);
  expect(result.products.nodes[0].title).toEqual("Fake Product 130");
});

test("expect an empty list of products filtered by visibility", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      isVisible: false,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(0);
});

test("expect an empty list of products filtered by archived", async () => {
  let result;

  try {
    result = await queryProducts({
      shopIds: [opaqueShopId],
      isArchived: true,
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.products.nodes.length).toEqual(0);
});
