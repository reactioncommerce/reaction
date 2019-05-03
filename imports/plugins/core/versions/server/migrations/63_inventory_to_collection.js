import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";
import rawCollections from "/imports/collections/rawCollections";
import findAndConvertInBatches from "../util/findAndConvertInBatchesNoMeteor";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const SimpleInventory = db.collection("SimpleInventory");

const {
  Catalog,
  Products
} = rawCollections;

Migrations.add({
  version: 63,
  up() {
    // Clear most inventory fields from Catalog. We'll use values from Products to populate the SimpleInventory collection
    Promise.await(Catalog.updateMany({}, {
      $unset: {
        "product.inventoryInStock": "",
        "product.inventoryAvailableToSell": "",
        "product.variants.$[].canBackorder": "",
        "product.variants.$[].inventoryInStock": "",
        "product.variants.$[].inventoryAvailableToSell": "",
        "product.variants.$[].inventoryManagement": "",
        "product.variants.$[].inventoryPolicy": "",
        "product.variants.$[].lowInventoryWarningThreshold": "",
        "product.variants.$[].isBackorder": "",
        "product.variants.$[].isLowQuantity": "",
        "product.variants.$[].isSoldOut": ""
      }
    }));

    Promise.await(Catalog.updateMany({
      "product.variants.options": { $exists: true }
    }, {
      $unset: {
        "product.variants.$[].options.$[].canBackorder": "",
        "product.variants.$[].options.$[].inventoryInStock": "",
        "product.variants.$[].options.$[].inventoryAvailableToSell": "",
        "product.variants.$[].options.$[].inventoryManagement": "",
        "product.variants.$[].options.$[].inventoryPolicy": "",
        "product.variants.$[].options.$[].lowInventoryWarningThreshold": "",
        "product.variants.$[].options.$[].isBackorder": "",
        "product.variants.$[].options.$[].isLowQuantity": "",
        "product.variants.$[].options.$[].isSoldOut": ""
      }
    }));

    Promise.await(findAndConvertInBatches({
      collection: Products,
      query: { type: "variant" },
      converter: async (variant) => {
        // If `inventoryManagement` prop is undefined, assume we already converted it and skip.
        if (variant.inventoryManagement === undefined) return null;

        const childOption = await Products.findOne({ ancestors: variant._id }, { projection: { _id: 1 } });
        if (!childOption) {
          // Create SimpleInventory record
          await SimpleInventory.updateOne(
            {
              productConfiguration: {
                productId: variant.ancestors[0],
                productVariantId: variant._id
              }
            },
            {
              $set: {
                canBackorder: !variant.inventoryPolicy,
                inventoryInStock: variant.inventoryInStock || 0,
                inventoryReserved: (variant.inventoryInStock || 0) - (variant.inventoryAvailableToSell || 0),
                isEnabled: variant.inventoryManagement || false,
                lowInventoryWarningThreshold: variant.lowInventoryWarningThreshold || 0,
                shopId: variant.shopId,
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            {
              upsert: true
            }
          );
        }

        delete variant.inventoryAvailableToSell;
        delete variant.inventoryInStock;
        delete variant.inventoryPolicy;
        delete variant.inventoryManagement;
        delete variant.lowInventoryWarningThreshold;
        delete variant.isBackorder;
        delete variant.isLowQuantity;
        delete variant.isSoldOut;

        return variant;
      }
    }));

    Promise.await(findAndConvertInBatches({
      collection: Products,
      query: { type: "simple" },
      converter: (product) => {
        delete product.inventoryAvailableToSell;
        delete product.inventoryInStock;
        delete product.inventoryPolicy;
        delete product.inventoryManagement;
        delete product.lowInventoryWarningThreshold;
        delete product.isBackorder;
        delete product.isLowQuantity;
        delete product.isSoldOut;

        return product;
      }
    }));
  }
});
