import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateProductVariantMutation = importAsString("./createProductVariant.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

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
  attributeLabel: null,
  barcode: null,
  height: null,
  index: null,
  isDeleted: false,
  isVisible: false,
  length: null,
  minOrderQuantity: null,
  optionTitle: null,
  originCountry: null,
  shop: {
    _id: opaqueShopId
  },
  sku: null,
  title: null,
  weight: null,
  width: null
};

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:products/create"],
  slug: "admin",
  shopId: internalShopId
});

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  mutate = testApp.mutate(CreateProductVariantMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Products.insertOne(mockProduct);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [adminGroup._id]
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("expect a variant to be created on a product using `productId` as input", async () => {
  let result;
  try {
    result = await mutate({ input: { productId: opaqueProductId, shopId: opaqueShopId } });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({
    createProductVariant: {
      variant: {
        _id: jasmine.any(String),
        ...mockVariant
      }
    }
  });
});

test("expect a variant to be created with all product variant input", async () => {
  const variantData = {
    attributeLabel: "attributeLabel",
    barcode: "barcode",
    height: 12,
    index: 5,
    isDeleted: false,
    isVisible: true,
    length: 13,
    minOrderQuantity: 99,
    optionTitle: "optionTitle",
    originCountry: "originCountry",
    sku: "sku",
    title: "title",
    weight: 14,
    width: 15
  };

  let result;
  try {
    result = await mutate({
      input: {
        productId: opaqueProductId,
        shopId: opaqueShopId,
        variant: variantData
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual({
    createProductVariant: {
      variant: {
        _id: jasmine.any(String),
        ...mockVariant,
        ...variantData
      }
    }
  });
});

test("non-opaque _id can be provided optionally", async () => {
  const id = "CUSTOM_VARIANT_ID";
  const encodedId = "cmVhY3Rpb24vcHJvZHVjdDpDVVNUT01fVkFSSUFOVF9JRA=="; // reaction/product:CUSTOM_VARIANT_ID

  let result;
  try {
    result = await mutate({
      input: {
        productId: opaqueProductId,
        shopId: opaqueShopId,
        variant: { _id: id }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.createProductVariant.variant._id).toEqual(encodedId);
});
