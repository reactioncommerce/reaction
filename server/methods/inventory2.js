import { Catalog } from "/lib/api";
import { Inventory } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";

//
// Inventory methods
//

Meteor.methods({
  /**
   * inventory/register
   * @summary check a product and update Inventory collection with inventory documents.
   * @param {Object} product - valid Schemas.Product object
   * @return {Number} - returns the total amount of new inventory created
   */
  "inventory/register": function (product) {
    let type;
    switch (product.type) {
    case "variant":
      check(product, Schemas.ProductVariant);
      type = "variant";
      break;
    default:
      check(product, Schemas.Product);
      type = "simple";
    }
    // user needs createProduct permission to register new inventory
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // this.unblock();

    let totalNewInventory = 0;
    const productId = type === "variant" ? product.ancestors[0] : product._id;
    const variants = Catalog.getVariants(productId);

    // we'll check each variant to see if it has been fully registered
    for (let variant of variants) {
      let inventory = Inventory.find({
        productId: productId,
        variantId: variant._id,
        shopId: product.shopId
      });
      // we'll return this as well
      let inventoryVariantCount = inventory.count();
      // if the variant exists already we're remove from the inventoryVariants
      // so that we don't process it as an insert
      if (inventoryVariantCount < variant.inventoryQuantity) {
        let newQty = variant.inventoryQuantity || 0;
        let i = inventoryVariantCount + 1;

        Logger.info(
          `inserting ${newQty - inventoryVariantCount
            } new inventory items for ${variant._id}`
        );

        const batch = Inventory.
        _collection.rawCollection().initializeUnorderedBulkOp();
        while (i <= newQty) {
          let id = Inventory._makeNewID();
          batch.insert({
            _id: id,
            productId: productId,
            variantId: variant._id,
            shopId: product.shopId,
            createdAt: new Date,
            updatedAt: new Date,
            workflow: { // we add this line because `batchInsert` doesn't know
              status: "new" // about SimpleSchema, so `defaultValue` will not
            }
          });
          i++;
        }

        // took from: http://guide.meteor.com/collections.html#bulk-data-changes
        let execute = Meteor.wrapAsync(batch.execute, batch);
        let inventoryItem = execute();
        let inserted = inventoryItem.nInserted;

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
  },
  /**
   * inventory/adjust
   * @summary adjust existing inventory when changes are made we get the
   * inventoryQuantity for each product variant, and compare the qty to the qty
   * in the inventory records we will add inventoryItems as needed to have the
   * same amount as the inventoryQuantity but when deleting, we'll refuse to
   * delete anything not workflow.status = "new"
   *
   * @param  {Object} product - Schemas.Product object
   * @return {[undefined]} returns undefined
   */
  "inventory/adjust": function (product) { // TODO: this should be variant
    let type;
    let results;
    // adds or updates inventory collection with this product
    switch (product.type) {
    case "variant":
      check(product, Schemas.ProductVariant);
      type = "variant";
      break;
    default:
      check(product, Schemas.Product);
      type = "simple";
    }
    // user needs createProduct permission to adjust inventory
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // this.unblock();

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
          for (let inventoryItem of removeInventory) {
            results -= Meteor.call("inventory/remove", inventoryItem);
            // we could add handling for the case when aren't enough "new" items
          }
        }
        Logger.info(
          `adjust variant ${variant._id} from ${itemCount} to ${results}`
        );
      }
    }
  },
  /**
   * inventory/remove
   * delete an inventory item permanently
   * @param  {Object} inventoryItem object type Schemas.Inventory
   * @return {String} return remove result
   */
  "inventory/remove": function (inventoryItem) {
    check(inventoryItem, Schemas.Inventory);
    // user needs createProduct permission to adjust inventory
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // this.unblock();
    // todo add bulkOp here

    Logger.debug("inventory/remove", inventoryItem);
    return Inventory.remove(inventoryItem);
  },
  /**
   * inventory/shipped
   * mark inventory as shipped
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/shipped": function (cartItems) {
    check(cartItems, [Schemas.CartItem]);
    return Meteor.call("inventory/setStatus", cartItems, "shipped");
  },
  /**
   * inventory/shipped
   * mark inventory as returned
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/return": function (cartItems) {
    check(cartItems, [Schemas.CartItem]);
    return Meteor.call("inventory/setStatus", cartItems, "return");
  },
  /**
   * inventory/shipped
   * mark inventory as return and available for sale
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/returnToStock": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    return Meteor.call("inventory/clearStatus", cartItems, "new", "return");
  }
});
