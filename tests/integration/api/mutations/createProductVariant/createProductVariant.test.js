import TestApp from "/imports/test-utils/helpers/TestApp";
import CreateProductVariantMutation from "./createProductVariant.graphql";

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
  variant: {
    isDeleted: false,
    isVisible: false,
    shop: {
      _id: opaqueShopId
    },
    title: ""
  }
};

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  mutate = testApp.mutate(CreateProductVariantMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Products.insert(mockProduct);

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
test("expect a variant to be created on a product using `productId` as input", async () => {
  let result;
  try {
    result = await mutate({ input: { productId: opaqueProductId, shopId: opaqueShopId } });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ createProductVariant: mockVariant });
});
