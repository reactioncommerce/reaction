import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateProductMutation = importAsString("./createProduct.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const shopName = "Test Shop";

const mockProduct = {
  product: {
    isDeleted: false,
    isVisible: false,
    shop: {
      _id: opaqueShopId
    },
    supportedFulfillmentTypes: ["shipping"],
    title: ""
  }
};

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  mutate = testApp.mutate(CreateProductMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:products/create"],
    slug: "admin",
    shopId: internalShopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [adminGroup._id],
    shopId: internalShopId
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

// create a new product
test("expect a product to be created using `shopId` as input", async () => {
  let result;
  try {
    result = await mutate({ input: { shopId: opaqueShopId } });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ createProduct: mockProduct });
});
