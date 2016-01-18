//
// Inventory methods
//

Meteor.methods({
  /**
   * inventory/register
   * @summary check a product and update Inventory collection with inventory documents.
   * @param {Object} product - valid ReactionCore.Schemas.Product object
   * @return {Number} - returns the total amount of new inventory created
   */
  "inventory/register": function (product) {
    check(product, ReactionCore.Schemas.Product);
    this.unblock();
    let totalNewInventory = 0;
    // user needs createProduct permission to register new inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // we'll check each variant to see if it has been fully registered
    for (let variant of product.variants) {
      let inventory = ReactionCore.Collections.Inventory.find({
        productId: product._id,
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

        ReactionInventory.Log.info(
          `inserting ${newQty - inventoryVariantCount} new inventory items for ${variant._id}`
        );

        let items = [];
        while (i <= newQty) {
          items.push({
            shopId: product.shopId,
            variantId: variant._id,
            productId: product._id
          });
          i++;
        }

        let inventoryItem = ReactionCore.Collections.Inventory.batchInsert(items);

        if (!inventoryItem) { // or maybe `inventory.length === 0`?
          // throw new Meteor.Error("Inventory Anomaly Detected. Abort! Abort!");
          return totalNewInventory;
        }
        ReactionInventory.Log.debug(`registered ${inventoryItem}`);
        totalNewInventory += inventoryItem.length;
      }
    }
    // returns the total amount of new inventory created
    return totalNewInventory;
  },
  /**
   * inventory/adjust
   * @summary adjust existing inventory when changes are made
   * we get the inventoryQuantity for each product variant,
   * and compare the qty to the qty in the inventory records
   * we will add inventoryItems as needed to have the same amount as the inventoryQuantity
   * but when deleting, we'll refuse to delete anything not workflow.status = "new"
   *
   * @param  {Object} product - ReactionCore.Schemas.Product object
   * @return {[undefined]} returns undefined
   */
  "inventory/adjust": function (product) {
    let type;
    let variant;
    // adds or updates inventory collection with this product
    switch (product.type) {
      case "variant":
        check(product, ReactionCore.Schemas.ProductVariant);
        type = "variant";
        variant = product; // just an alias
        break;
      default:
        check(product, ReactionCore.Schemas.Product);
        type = "simple";
    }
    this.unblock();

    // user needs createProduct permission to adjust inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // Quantity and variants of this product's variant inventory
    if (type === "variant") {
      let inventoryVariants =  {
        _id: variant._id,
        qty: variant.inventoryQuantity || 0
      };
    }

    for (let variant of inventoryVariants) {
      let Inventory = ReactionCore.Collections.Inventory.find({
        productId: product._id,
        variantId: variant._id
      });
      let itemCount = Inventory.count();

      if (itemCount !== variant.qty) {
        ReactionInventory.Log.info(
          `adjust variant ${variant._id} from ${itemCount} to ${variant.qty} `
        );

        if (itemCount < variant.qty) {
          // we need to register some new variants to inventory
          Meteor.call("inventory/register", product);
        }
        else if (itemCount > variant.qty) {
          // determine how many records to delete
          removeQty = itemCount - variant.qty;
          // we're only going to delete records that are new
          let removeInventory = ReactionCore.Collections.Inventory.find({
            "productId": product._id,
            "variantId": variant._id,
            "workflow.status": "new"
          }, {
            sort: {
              updatedAt: -1
            },
            limit: removeQty
          }).fetch();

          // delete latest inventory "status:new" records
          for (let inventoryItem of removeInventory) {
            Meteor.call("inventory/remove", inventoryItem);
            // we could add handling for the case when aren't enough "new" items
          }
        }
      }
    }
    return;
  },
  /**
   * inventory/remove
   * delete an inventory item permanently
   * @param  {Object} inventoryItem object type ReactionCore.Schemas.Inventory
   * @return {String} return remove result
   */
  "inventory/remove": function (inventoryItem) {
    check(inventoryItem, ReactionCore.Schemas.Inventory);
    this.unblock();
    // user needs createProduct permission to adjust inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    ReactionInventory.Log.debug("inventory/remove", inventoryItem);
    return ReactionCore.Collections.Inventory.remove(inventoryItem);
  },
  /**
   * inventory/shipped
   * mark inventory as shipped
   * @param  {Array} cartItems array of objects ReactionCore.Schemas.CartItem
   * @return {undefined}
   */
  "inventory/shipped": function (cartItems) {
    check(cartItems, [ReactionCore.Schemas.CartItem]);
    return Meteor.call("inventory/setStatus", cartItems, "shipped");
  },
  /**
   * inventory/shipped
   * mark inventory as returned
   * @param  {Array} cartItems array of objects ReactionCore.Schemas.CartItem
   * @return {undefined}
   */
  "inventory/return": function (cartItems) {
    check(cartItems, [ReactionCore.Schemas.CartItem]);
    return Meteor.call("inventory/setStatus", cartItems, "return");
  },
  /**
   * inventory/shipped
   * mark inventory as return and available for sale
   * @param  {Array} cartItems array of objects ReactionCore.Schemas.CartItem
   * @return {undefined}
   */
  "inventory/returnToStock": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    return Meteor.call("inventory/clearStatus", cartItems, "new", "return");
  }
});
