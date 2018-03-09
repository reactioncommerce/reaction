import { Meteor } from "meteor/meteor";
import { Catalog } from "/lib/api";
import { Inventory, Products } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

/**
 * inventory/register
 * @summary check a product and update Inventory collection with inventory documents.
 * @param {Object} product - valid Schemas.Product object
 * @return {Number} - returns the total amount of new inventory created
 */
export function registerInventory(product) {
  // Retrieve schemas
  // TODO: Permit product type registration and iterate through product types and schemas
  Products.simpleSchema(product).validate(product);
  const { type } = product;

  let totalNewInventory = 0;
  const productId = type === "variant" ? product.ancestors[0] : product._id;
  const variants = Catalog.getVariants(productId);

  // we'll check each variant to see if it has been fully registered
  for (const variant of variants) {
    const inventory = Inventory.find({
      productId,
      variantId: variant._id,
      shopId: product.shopId
    });
    // we'll return this as well
    const inventoryVariantCount = inventory.count();
    // if the variant exists already we're remove from the inventoryVariants
    // so that we don't process it as an insert
    if (inventoryVariantCount < variant.inventoryQuantity) {
      const newQty = variant.inventoryQuantity || 0;
      let i = inventoryVariantCount + 1;

      Logger.debug(`inserting ${newQty - inventoryVariantCount} new inventory items for ${variant._id}`);

      const batch = Inventory._collection.rawCollection().initializeUnorderedBulkOp();
      while (i <= newQty) {
        const id = Inventory._makeNewID();
        batch.insert({
          _id: id,
          productId,
          variantId: variant._id,
          shopId: product.shopId,
          createdAt: new Date(),
          updatedAt: new Date(),
          workflow: { // we add this line because `batchInsert` doesn't know
            status: "new" // about SimpleSchema, so `defaultValue` will not
          }
        });
        i += 1;
      }

      // took from: http://guide.meteor.com/collections.html#bulk-data-changes
      const execute = Meteor.wrapAsync(batch.execute, batch);
      const inventoryItem = execute();
      const inserted = inventoryItem.nInserted;

      if (!inserted) { // or maybe `inventory.length === 0`?
        // throw new Meteor.Error("Inventory Anomaly Detected. Abort! Abort!");
        return totalNewInventory;
      }
      Logger.debug(`registered ${inserted}`);
      totalNewInventory += inserted;
    }
  }
  // returns the total amount of new inventory created
  return totalNewInventory;
}

function adjustInventory(product, userId, context) {
  // TODO: This can fail even if updateVariant succeeds.
  Products.simpleSchema(product).validate(product);
  const { type } = product;
  let results;

  // calledByServer is only true if this method was triggered by the server, such as from a webhook.
  // there will be a null connection and no userId.
  const calledByServer = (context && context.connection === null && !Meteor.userId());
  // if this method is calledByServer, skip permission check.
  // user needs createProduct permission to adjust inventory
  // REVIEW: Should this be checking shop permission instead?
  if (!calledByServer && !Reaction.hasPermission("createProduct", userId, product.shopId)) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Quantity and variants of this product's variant inventory
  if (type === "variant") {
    const variant = {
      _id: product._id,
      qty: product.inventoryQuantity || 0
    };

    const inventory = Inventory.find({
      productId: product.ancestors[0],
      variantId: product._id
    });
    const itemCount = inventory.count();

    if (itemCount !== variant.qty) {
      if (itemCount < variant.qty) {
        // we need to register some new variants to inventory
        results = itemCount + Meteor.call("inventory/register", product);
      } else if (itemCount > variant.qty) {
        // determine how many records to delete
        const removeQty = itemCount - variant.qty;
        // we're only going to delete records that are new
        const removeInventory = Inventory.find({
          "variantId": variant._id,
          "workflow.status": "new"
        }, {
          sort: {
            updatedAt: -1
          },
          limit: removeQty
        }).fetch();

        results = itemCount;
        // delete latest inventory "status:new" records
        for (const inventoryItem of removeInventory) {
          results -= Meteor.call("inventory/remove", inventoryItem);
          // we could add handling for the case when aren't enough "new" items
        }
      }
      Logger.debug(`adjust variant ${variant._id} from ${itemCount} to ${results}`);
    }
  }
}

Meteor.methods({
  "inventory/register"(product) {
    if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    registerInventory(product);
  },
  "inventory/adjust"(product) { // TODO: this should be variant
    Products.simpleSchema(product).validate(product);
    adjustInventory(product, this.userId, this);
  }
});
