/**
 * Inventory Methods
 * @param {Object} product object as param
 * @return {null} return null
 */
Meteor.methods({
  //
  // adds or updates inventory collection with this product
  //
  "inventory/register": function (product) {
    check(product, ReactionCore.Schemas.Product);
    this.unblock();
    let Inventory = ReactionCore.Collections.Inventory.find({productId: product._id});
    let inventoryVariants = product.variants.map(variant => variant._id); // variants to register
    let inventoryItems = []; // empty array to be populated with items that we'll add to inventory

    // we have existing inventory for this product
    if (Inventory.count() > 0) {
      // we'll check each variant to see if it has been registered
      Inventory.forEach(function (inventoryProduct) {
        let variantIndex = inventoryVariants.indexOf(inventoryProduct.variantId);
        // if the variant exists already we're remove from the inventoryVariants
        // so that we don't process it as an insert
        if (variantIndex !== -1) {
          inventoryVariants.splice(variantIndex, 1);
        }
      });
    }

    // the inventoryVariants array now has all the new variants
    // we want to register. we're going to assemble them into a
    // document array before inserting variants into Inventory
    for (let variantId of inventoryVariants)  {
      let variant = _.findWhere(product.variants, {_id: variantId});
      let newQty = variant.inventoryQuantity || 0;
      ReactionCore.Log.info(`inserting ${newQty} new inventory items for ${variantId}`);
      // this actually won't run most of the time, new items don't usually
      // have any inventoryQuantity assigned, but we'll also run
      // this logic in the update and catch when a
      // inventoryQuantity is assigned.
      let i = 0;
      while (i <= newQty) {
        inventoryItems.push({
          shopId: product.shopId,
          variantId: variantId,
          productId: product._id
        });
        i++;
      }
    }

    // write the entire document array
    if (inventoryItems.length > 0) {
     // because meteor doesn't support bulk doc update
     // we'll loop and insert. we could bypass meteor
     // and go to mongo direct, and probably should.
      for (let inventoryItem of inventoryItems) {
        ReactionCore.Collections.Inventory.insert(inventoryItem);
      }
    }
    ReactionCore.Log.info("inventory/register finished");
    return;
  },
  /**
   * inventory/adjust
   * adjust existing inventory when changes are made
   *
   * @param  {Object} product - product object
   * @return {[undefined]} returns undefined
   */
  "inventory/adjust": function (product) {
    // adds or updates inventory collection with this product
    check(product, ReactionCore.Schemas.Product);
    this.unblock();
    //
    //  we get the inventoryQuantity for each product variant,
    // and compare the qty to the qty in the inventory records
    // we will add inventoryItems as needed to have the same amount as the inventoryQuantity
    // but when deleting, we'll refuse to delete anything not workflow.status = "new"
    //
  },
  "inventory/addReserve": function (productId, variantId, options) {
    check(productId, String);
    check(variantId, String);
    check(options, Object);
    // WIP placeholder
    ReactionCore.Log.info("inventory/addHold");
    return;
  },
  //
  // clear inventory "reserver"
  //
  "inventory/clearReserve": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // WIP placeholder
    ReactionCore.Log.info("inventory/clearHold");
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
