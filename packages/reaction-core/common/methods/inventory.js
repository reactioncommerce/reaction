//
// Inventory methods
//

Meteor.methods({
  /**
   * inventory/register
   * @param {Object} product - valid ReactionCore.Schemas.Product object
   * @return {undefined}
   */
  "inventory/register": function (product) {
    check(product, ReactionCore.Schemas.Product);
    this.unblock();

    // user needs createProduct permission to register new inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // we'll check each variant to see if it has been fully registered
    for (let variant of product.variants) {
      let inventory = ReactionCore.Collections.Inventory.find({
        productId: product._id,
        variantId: variant._id
      });
      let inventoryVariantCount = inventory.count();
      // if the variant exists already we're remove from the inventoryVariants
      // so that we don't process it as an insert
      if (inventoryVariantCount < variant.inventoryQuantity) {
        let newQty = variant.inventoryQuantity || 0;
        let i = inventoryVariantCount + 1;

        ReactionCore.Log.debug(
          `inserting ${inventoryVariantCount - newQty} new inventory items for ${variant._id}`);

        while (i <= newQty) {
          inventoryItem = {
            shopId: product.shopId,
            variantId: variant._id,
            productId: product._id
          };
          ReactionCore.Collections.Inventory.insert(inventoryItem);
          ReactionCore.Log.info("inventory/register added", inventoryItem);
          i++;
        }
      }
    }
    return;
  },
  /**
   * inventory/adjust
   * adjust existing inventory when changes are made
   * we get the inventoryQuantity for each product variant,
   * and compare the qty to the qty in the inventory records
   * we will add inventoryItems as needed to have the same amount as the inventoryQuantity
   * but when deleting, we'll refuse to delete anything not workflow.status = "new"
   *
   * @param  {Object} product - ReactionCore.Schemas.Product object
   * @return {[undefined]} returns undefined
   */
  "inventory/adjust": function (product) {
    // adds or updates inventory collection with this product
    check(product, ReactionCore.Schemas.Product);
    this.unblock();

    // user needs createProduct permission to adjust inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // variants to register
    let inventoryVariants = product.variants.map(variant => {
      return {
        _id: variant._id,
        qty: variant.inventoryQuantity || 0
      };
    }); // Quantity and variants of this product's inventory

    for (let variant of inventoryVariants) {
      let Inventory = ReactionCore.Collections.Inventory.find({
        productId: product._id,
        variantId: variant._id
      });
      let itemCount = Inventory.count();
      ReactionCore.Log.info(
        `found inventory count: ${itemCount} variant.inventoryQuantity ${variant.qty} variant._id: ${variant._id}`
      );
      // we need to register some new variants to inventory
      if (itemCount < variant.qty) {
        Meteor.call("inventory/register", product);
      }
      // we're adding variants to inventory
      if (itemCount > variant.qty) {
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

        // delete latest inventory records that are new
        for (let inventoryItem of removeInventory) {
          ReactionCore.Log.info("removing excess inventory");
          // we can only remove inventory marked as new
          Meteor.call("inventory/remove", inventoryItem);
        }
        // we could add logic here to move othere inventory items to a retired status
        // if there aren't enough "new" items to remove
      }
    }
  },
  "inventory/remove": function (inventoryItem) {
    check(inventoryItem, ReactionCore.Schemas.Inventory);
    this.unblock();
    // user needs createProduct permission to adjust inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    ReactionCore.Log.info("inventory/remove", inventoryItem);
    return ReactionCore.Collections.Inventory.remove(inventoryItem);
  },
  /**
   * inventory/addReserve
   *
   * @param  {Object} cartItems object should be of type ReactionCore.Schemas.Cart.items
   * @param  {String} status optional - sets the inventory workflow status, defaults to "reserved"
   * @return {undefined} returns undefined
   */
  "inventory/addReserve": function (cartItems, status) {
    check(cartItems, [ReactionCore.Schemas.CartItem]);
    check(status, Match.Optional(String));
    this.unblock();
    const newStatus = status || "reserved";
    // update each cart item in inventory
    for (let item of cartItems) {
      // check of existing reserved inventory for this cart
      let existingReservations = ReactionCore.Collections.Inventory.find({
        productId: item.productId,
        variantId: item.variants._id,
        shopId: item.shopId,
        orderId: item._id
      });
      let i = existingReservations.count();
      // add new reservations
      while (i <= item.quantity) {
        ReactionCore.Collections.Inventory.update({
          "productId": item.productId,
          "variantId": item.variants._id,
          "shopId": item.shopId,
          "workflow.status": "new"
        }, {
          $set: {
            "orderId": item._id,
            "workflow.status": newStatus
          }
        });
        i++;
      }
    }
    ReactionCore.Log.info("inventory/addReserve", newStatus);
    return;
  },
  //
  // clear inventory "reserver"
  //
  "inventory/clearReserve": function (cartItems, status, reserve) {
    check(cartItems, [ReactionCore.Schemas.CartItem]);
    check(status, Match.Optional(String)); // should be a constant or workflow definition
    check(reserve, Match.Optional(String)); // should be a constant or workflow definition
    this.unblock();

    // optional workflow status or default to "new"
    let newStatus = status || "new";
    let oldStatus = reserve || "reserved";

    // remove each cart item in inventory
    for (let item of cartItems) {
      // check of existing reserved inventory for this cart
      let existingReservations = ReactionCore.Collections.Inventory.find({
        "productId": item.productId,
        "variantId": item.variants._id,
        "shopId": item.shopId,
        "orderId": item._id,
        "workflow.status": oldStatus
      });
      let i = existingReservations.count();
      // add new reservations
      while (i <= item.quantity) {
        ReactionCore.Collections.Inventory.update({
          "productId": item.productId,
          "variantId": item.variants._id,
          "shopId": item.shopId,
          "workflow.status": oldStatus
        }, {
          $set: {
            "orderId": item._id,
            "workflow.status": newStatus
          }
        });
        i++;
      }
    }
    ReactionCore.Log.info("inventory/clearReserve", newStatus);
    return;
  },
  //
  // send low stock warnings
  //
  "inventory/lowStock": function (product) {
    check(product, ReactionCore.Schemas.Product);
    // WIP placeholder
    ReactionCore.Log.info("inventory/lowStock");
    return;
  },
  //
  // mark inventory as shipped
  //
  "inventory/shipped": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // WIP placeholder
    ReactionCore.Log.info("inventory/shipped");
    return;
  },
  //
  // mark inventory as returned
  //
  "inventory/return": function (inventoryId, productId, variantId) {
    check(inventoryId, String);
    check(productId, String);
    check(variantId, String);

    // WIP placeholder
    ReactionCore.Log.info("inventory/return");
    return;
  },
  //
  // mark inventory as return and available for sale
  //
  "inventory/returnToStock": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // WIP placeholder
    ReactionCore.Log.info("inventory/returnToStock");
    return;
  }
});
