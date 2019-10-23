import TestApp from "/imports/test-utils/helpers/TestApp";
import CreateProductMutation from "./createProduct.graphql";

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
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

  await testApp.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["createProduct"] }
  });
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Products.deleteOne({ _id: internalProductId });
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

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
