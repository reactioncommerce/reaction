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
    // check(product, ReactionCore.Schemas.Product);
    let type;
    switch (product.type) {
      case "variant":
        check(product, ReactionCore.Schemas.ProductVariant);
        type = "variant";
        break;
      default:
        check(product, ReactionCore.Schemas.Product);
        type = "simple";
    }
    this.unblock();
    let totalNewInventory = 0;
    // user needs createProduct permission to register new inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let variants;
    // we'll check each variant to see if it has been fully registered
    if (type === "variant") {
      variants = ReactionCore.getVariants(product.ancestors[0]);

    } else if (type === "simple") {
      variants = ReactionCore.getVariants(product._id);
    }
    for (let variant of variants) {
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
            productId: product._id,
            variantId: variant._id,
            shopId: product.shopId,
            createdAt: new Date,
            updatedAt: new Date,
            workflow: { // we add this line because `batchInsert` doesn't know
              status: "new" // about SimpleSchema, so `defaultValue` will not
            } // work with it
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
    // adds or updates inventory collection with this product
    switch (product.type) {
      case "variant":
        check(product, ReactionCore.Schemas.ProductVariant);
        type = "variant";
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
    //let inventoryVariants;
    // Quantity and variants of this product's variant inventory
    if (type === "variant") {
      //inventoryVariants = ReactionCore.Collections.Products.find({
      //  ancestors: {
      //    $in: [product.ancestors[0]]
      //  }
      //});
      const variant = {
        _id: product._id,
        qty: product.inventoryQuantity || 0
      };

      const inventory = ReactionCore.Collections.Inventory.find({
        productId: product.ancestors[0],
        variantId: product._id
      });
      const itemCount = inventory.count();

      if (itemCount !== variant.qty) {
        ReactionInventory.Log.info(
          `adjust variant ${variant._id} from ${itemCount} to ${variant.qty}`
        );

        if (itemCount < variant.qty) {
          // we need to register some new variants to inventory
          return Meteor.call("inventory/register", product);
        } else if (itemCount > variant.qty) {
          // determine how many records to delete
          const removeQty = itemCount - variant.qty;
          // we're only going to delete records that are new
          const removeInventory = ReactionCore.Collections.Inventory.find({
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
