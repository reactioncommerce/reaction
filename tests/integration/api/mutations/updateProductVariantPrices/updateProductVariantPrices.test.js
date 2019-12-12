import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const updateProductVariantPricesMutation = importAsString("./updateProductVariantPricesMutation.graphql");

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
  type: "variant",
  compareAtPrice: 12.99,
  price: 10.99
};

let testApp;
let updateProductVariantPrices;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  updateProductVariantPrices = testApp.mutate(updateProductVariantPricesMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);

  await testApp.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["createProduct"] }
  });
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Products.deleteOne({ _id: internalProductId });
  await testApp.collections.Products.deleteOne({ _id: internalVariantIds[0] });
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

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
