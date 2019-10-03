import waitForExpect from "wait-for-expect";
import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import updateSimpleInventoryBulk from "/imports/node-app/plugins/simple-inventory/mutations/updateSimpleInventoryBulk.js";
import catalogItemQuery from "./catalogItemQuery.graphql";

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "product1";
const internalVariantId = "variant1";
const internalOptionId1 = "option1";
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

let testApp;
let getCatalogItem;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.Products.insertOne(option1);
  await testApp.collections.Products.insertOne(option2);

  await testApp.publishProducts([internalProductId]);

  getCatalogItem = testApp.query(catalogItemQuery);
});

afterAll(async () => {
  await testApp.collections.Products.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.stop();
});

test("when all options are sold out and canBackorder, isBackorder is true in Catalog", async () => {
  const {
    failedUpdates,
    invalidUpdates
  } = await updateSimpleInventoryBulk({
    ...testApp.context,
    isInternalCall: true
  }, {
    updates: [
      {
        productConfiguration: {
          productId: internalProductId,
          productVariantId: internalOptionId1
        },
        shopId: internalShopId,
        isEnabled: true,
        canBackorder: true,
        inventoryInStock: 0
      },
      {
        productConfiguration: {
          productId: internalProductId,
          productVariantId: internalOptionId2
        },
        shopId: internalShopId,
        isEnabled: true,
        canBackorder: true,
        inventoryInStock: 0
      }
    ]
  });

  expect(failedUpdates).toEqual([]);
  expect(invalidUpdates).toEqual([]);

  // Need to wait until "afterBulkInventoryUpdate" event listeners have run
  await waitForExpect(async () => {
    const queryResult = await getCatalogItem({
      slugOrId: product.handle
    });
    expect(queryResult).toEqual({
      catalogItemProduct: {
        product: {
          isBackorder: true,
          isLowQuantity: true,
          isSoldOut: true,
          variants: [{
            canBackorder: true,
            inventoryAvailableToSell: 0,
            inventoryInStock: 0,
            isBackorder: true,
            isLowQuantity: true,
            isSoldOut: true,
            options: [
              {
                canBackorder: true,
                inventoryAvailableToSell: 0,
                inventoryInStock: 0,
                isBackorder: true,
                isLowQuantity: true,
                isSoldOut: true
              },
              {
                canBackorder: true,
                inventoryAvailableToSell: 0,
                inventoryInStock: 0,
                isBackorder: true,
                isLowQuantity: true,
                isSoldOut: true
              }
            ]
          }]
        }
      }
    });
  });
});
