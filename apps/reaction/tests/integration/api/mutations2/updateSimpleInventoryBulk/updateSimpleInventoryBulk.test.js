import waitForExpect from "wait-for-expect";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const catalogItemQuery = importAsString("./catalogItemQuery.graphql");

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
  handle: "product1",
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
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.collections.Products.insertOne(option1);
  await testApp.collections.Products.insertOne(option2);

  await testApp.publishProducts([internalProductId]);

  getCatalogItem = testApp.query(catalogItemQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("when all options are sold out and canBackorder, isBackorder is true in Catalog", async () => {
  const {
    failedUpdates,
    invalidUpdates
  } = await testApp.context.mutations.updateSimpleInventoryBulk(testApp.context.getInternalContext(), {
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
