import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import simpleInventoryQuery from "./simpleInventoryQuery.graphql";

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalProductId = "product1";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDpwcm9kdWN0MQ==";
const internalVariantId = "variant1";
const internalOptionId1 = "option1";
const opaqueOptionId1 = "cmVhY3Rpb24vcHJvZHVjdDpvcHRpb24x";
const internalOptionId2 = "option2";
const shopName = "Test Shop";

const product = Factory.Product.makeOne({
  _id: internalProductId,
  ancestors: [],
  handle: "test-product",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "simple"
});

const variant = Factory.Product.makeOne({
  _id: internalVariantId,
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const option1 = Factory.Product.makeOne({
  _id: internalOptionId1,
  ancestors: [internalProductId, internalVariantId],
  attributeLabel: "Option",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const option2 = Factory.Product.makeOne({
  _id: internalOptionId2,
  ancestors: [internalProductId, internalVariantId],
  attributeLabel: "Option",
  isDeleted: false,
  isVisible: true,
  shopId: internalShopId,
  type: "variant"
});

const mockCustomerAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: []
  },
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["admin"]
  },
  shopId: internalShopId
});

let testApp;
let simpleInventory;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.Products.insertOne(option1);
  await testApp.collections.Products.insertOne(option2);

  await testApp.publishProducts([internalProductId]);

  await testApp.createUserAndAccount(mockCustomerAccount);
  await testApp.createUserAndAccount(mockAdminAccount);

  simpleInventory = testApp.query(simpleInventoryQuery);
});

afterAll(async () => {
  await testApp.collections.Products.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("throws access-denied when getting simpleInventory if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await simpleInventory({
      productConfiguration: {
        productId: opaqueProductId,
        productVariantId: opaqueOptionId1
      },
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("returns null if no SimpleInventory record", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await simpleInventory({
    productConfiguration: {
      productId: opaqueProductId,
      productVariantId: opaqueOptionId1
    },
    shopId: opaqueShopId
  });
  expect(result).toEqual({
    simpleInventory: null
  });
});
