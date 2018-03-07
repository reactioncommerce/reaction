import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Inventory } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Logger, Reaction } from "/server/api";

// TODO statusChanges DDP limiting Disabled for now, needs more testing.

// // Define a rate limiting rule that matches update attempts by non-admin users
// const addReserveRule = {
//   userId: function (userId) {
//     return Roles.userIsInRole(userId, "createProduct", Reaction.getShopId());
//   },
//   type: "subscription",
//   method: "Inventory"
// };
//
// // Define a rate limiting rule that matches backorder attempts by non-admin users
// const addBackorderRule = {
//   userId: function (userId) {
//     return Roles.userIsInRole(userId, "createProduct", Reaction.getShopId());
//   },
//   type: "method",
//   method: "inventory/backorder"
// };
//
// // Add the rule, allowing up to 5 messages every 1000 milliseconds.
// DDPRateLimiter.addRule(addReserveRule, 5, 1000);
// DDPRateLimiter.addRule(addBackorderRule, 5, 1000);

/**
 * @file Methods for Inventory. Run these methods using `Meteor.call()`
 *
 *
 * @namespace Methods/Inventory
*/
Meteor.methods({
  /**
   * @name inventory/setStatus
   * @method
   * @memberof Methods/Inventory
   * @summary Sets status from one status to a new status. Defaults to `new` to `reserved`
   * @example Meteor.call("inventory/backorder", reservation, backOrderQty);
   * @param  {Array} cartItems array of objects of type Schemas.CartItems
   * @param  {String} status optional - sets the inventory workflow status, defaults to `reserved`
   * @param  {String} currentStatus - what is the current status to change `from`
   * @param  {String} notFoundStatus - what to use if the status is not found
   * @todo move this to bulkOp
   * @return {Number} returns reservationCount
   */
  "inventory/setStatus"(cartItems, status, currentStatus, notFoundStatus) {
    Schemas.CartItem.validate(cartItems);
    check(status, Match.Optional(String));
    check(currentStatus, Match.Optional(String));
    check(notFoundStatus, Match.Optional(String));
    this.unblock();

    // check basic user permissions
    // if (!Reaction.hasPermission(["guest", "anonymous"])) {
    //   throw new Meteor.Error("access-denied", "Access Denied");
    // }

    // set defaults
    const reservationStatus = status || "reserved"; // change status to options object
    const defaultStatus = currentStatus || "new"; // default to the "new" status
    const backorderStatus = notFoundStatus || "backorder"; // change status to options object
    let reservationCount;
    Logger.debug(`Moving Inventory items from ${defaultStatus} to ${reservationStatus}`);

    // update inventory status for cartItems
    for (const item of cartItems) {
      // check of existing reserved inventory for this cart
      const existingReservations = Inventory.find({
        productId: item.productId,
        variantId: item.variants._id,
        shopId: item.shopId,
        orderItemId: item._id
      });

      // define a new reservation
      const availableInventory = Inventory.find({
        "productId": item.productId,
        "variantId": item.variants._id,
        "shopId": item.shopId,
        "workflow.status": defaultStatus
      });

      const totalRequiredQty = item.quantity;
      const availableInventoryQty = availableInventory.count();
      let existingReservationQty = existingReservations.count();

      Logger.debug("totalRequiredQty", totalRequiredQty);
      Logger.debug("availableInventoryQty", availableInventoryQty);

      // if we don't have existing inventory we create backorders
      if (totalRequiredQty > availableInventoryQty) {
        // TODO put in a dashboard setting to allow backorder or altenate handler to be used
        const backOrderQty = Number(totalRequiredQty - availableInventoryQty - existingReservationQty);
        Logger.debug(`no inventory found, create ${backOrderQty} ${backorderStatus}`);
        // define a new reservation
        const reservation = {
          productId: item.productId,
          variantId: item.variants._id,
          shopId: item.shopId,
          orderItemId: item._id,
          workflow: {
            status: backorderStatus
          }
        };

        Meteor.call("inventory/backorder", reservation, backOrderQty);
        existingReservationQty = backOrderQty;
      }
      // if we have inventory available, only create additional required reservations
      Logger.debug("existingReservationQty", existingReservationQty);
      reservationCount = existingReservationQty;
      let newReservedQty;
      if (reservationStatus === "reserved" && defaultStatus === "new") {
        newReservedQty = totalRequiredQty - existingReservationQty + 1;
      } else {
        // when moving from one "reserved" type status, we don't need to deal with existingReservationQty
        newReservedQty = totalRequiredQty + 1;
      }

      let i = 1;
      while (i < newReservedQty) {
        // updated existing new inventory to be reserved
        Logger.debug(`updating reservation status ${i} of ${newReservedQty - 1}/${totalRequiredQty} items.`);
        // we should be updating existing inventory here.
        // backorder process created additional backorder inventory if there
        // wasn't enough.
        Inventory.update({
          "productId": item.productId,
          "variantId": item.variants._id,
          "shopId": item.shopId,
          "workflow.status": defaultStatus
        }, {
          $set: {
            "orderItemId": item._id,
            "workflow.status": reservationStatus
          }
        });
        reservationCount += 1;
        i += 1;
      }
    }
    Logger.debug(`finished creating ${reservationCount} new ${reservationStatus} reservations`);
    return reservationCount;
  },

  /**
   * @name inventory/clearStatus
   * @method
   * @memberof Methods/Inventory
   * @summary Used to reset status on inventory item (defaults to `new`)
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @param  {Array} status optional reset workflow.status, defaults to `new`
   * @param  {Array} currentStatus optional matching workflow.status, defaults to `reserved`
   * @return {undefined} undefined
   */
  "inventory/clearStatus"(cartItems, status, currentStatus) {
    Schemas.CartItem.validate(cartItems);
    check(status, Match.Optional(String)); // workflow status
    check(currentStatus, Match.Optional(String));
    this.unblock();

    // // check basic user permissions
    // if (!Reaction.hasPermission(["guest", "anonymous"])) {
    //   throw new Meteor.Error("access-denied", "Access Denied");
    // }

    // optional workflow status or default to "new"
    const newStatus = status || "new";
    const oldStatus = currentStatus || "reserved";

    // remove each cart item in inventory
    for (const item of cartItems) {
      // check of existing reserved inventory for this cart
      const existingReservations = Inventory.find({
        "productId": item.productId,
        "variantId": item.variants._id,
        "shopId": item.shopId,
        "orderItemId": item._id,
        "workflow.status": oldStatus
      });
      const reservationsCount = existingReservations.count();
      let clearCount = item.quantity;
      // reset existing cartItem reservations
      while (clearCount && reservationsCount) {
        Inventory.update({
          "productId": item.productId,
          "variantId": item.variants._id,
          "shopId": item.shopId,
          "orderItemId": item._id,
          "workflow.status": oldStatus
        }, {
          $set: {
            "orderItemId": "", // clear order/cart
            "workflow.status": newStatus // reset status
          }
        });

        clearCount -= 1;
      }
    }
    Logger.debug("inventory/clearReserve", newStatus);
  },

  /**
   * @name inventory/clearReserve
   * @method
   * @memberof Methods/Inventory
   * @example Meteor.call("inventory/clearReserve", cart.items)
   * @summary Resets `reserved` items to `new`
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/clearReserve"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/clearStatus", cartItems);
  },

  /**
   * @name inventory/addReserve
   * @summary Converts new items to reserved, or backorders
   * @method
   * @example Meteor.call("inventory/addReserve", cart.items)
   * @memberof Methods/Inventory
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/addReserve"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/setStatus", cartItems);
  },

  /**
   * @name inventory/backorder
   * @summary Used by the cart process to create a new Inventory backorder item,
   * but this could be used for inserting any custom inventory.
   * @method
   * A note on DDP Limits: As these are wide open we defined some {@link http://docs.meteor.com/#/full/ddpratelimiter ddp limiting rules}
   * @memberof Methods/Inventory
   * @param {Object} reservation Schemas.Inventory
   * @param {Number} backOrderQty number of backorder items to create
   * @returns {Number} number of inserted backorder documents
   */
  "inventory/backorder"(reservation, backOrderQty) {
    Schemas.Inventory.validate(reservation);
    check(backOrderQty, Number);
    this.unblock();

    // this use case could happen when mergeCart is fired. We don't add anything
    // or remove, just item owner changed. We need to add this check here
    // because of bulk operation. It throws exception if nothing to operate.
    if (backOrderQty === 0) {
      return 0;
    }

    // TODO inventory/backorder need to look carefully and understand is it possible ho have a
    // negative `backOrderQty` value here?

    // check basic user permissions
    // if (!Reaction.hasPermission(["guest","anonymous"])) {
    //   throw new Meteor.Error("access-denied", "Access Denied");
    // }

    // set defaults
    const newReservation = reservation;
    if (!newReservation.workflow) {
      newReservation.workflow = {
        status: "backorder"
      };
    }

    // insert backorder
    let i = 0;
    const batch = Inventory.rawCollection().initializeUnorderedBulkOp();
    if (batch) {
      while (i < backOrderQty) {
        const id = Inventory._makeNewID();
        batch.insert(Object.assign({ _id: id }, newReservation));
        i += 1;
      }

      const execute = Meteor.wrapAsync(batch.execute, batch);
      if (batch.length) {
        const inventoryBackorder = execute();
        const inserted = inventoryBackorder.nInserted;
        Logger.debug(`created ${inserted} backorder records for product ${newReservation.productId}, variant ${newReservation.variantId}`);
        return inserted;
      }
    }
    //
    // TODO implement a backup inventory/backorder method if bulk operations fail.
    //
    Logger.error("skipped bulk operations backorder updates.");
    return null;
  },

  /**
   * @name inventory/lowStock
   * @summary Send low stock warnings
   * @method
   * @memberof Methods/Inventory
   * @param  {Object} product object type Product
   * @return {undefined}
   * @todo implement inventory/lowstock calculations
   */
  "inventory/lowStock"(product) {
    Schemas.Product.validate(product);
    // placeholder is here to give plugins a place to hook into
    Logger.debug("inventory/lowStock");
  },

  /**
   * @name inventory/remove
   * @summary Delete an inventory item permanently
   * @method
   * @memberof Methods/Inventory
   * @param  {Object} inventoryItem object type Schemas.Inventory
   * @return {String} return remove result
   */
  "inventory/remove"(inventoryItem) {
    Schemas.Inventory.validate(inventoryItem);
    // user needs createProduct permission to adjust inventory
    // REVIEW: Should this be checking against shop permissions instead?

    // calledByServer is only true if this method was triggered by the server, such as from a webhook.
    // there will be a null connection and no userId.
    const calledByServer = (this.connection === null && !Meteor.userId());

    if (!calledByServer && !Reaction.hasPermission("createProduct", this.userId, inventoryItem.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    // this.unblock();
    // TODO: add bulkOp here

    Logger.debug("inventory/remove", inventoryItem);
    return Inventory.remove(inventoryItem);
  },

  /**
   * @name inventory/shipped
   * @method
   * @memberof Methods/Inventory
   * @summary Mark inventory as shipped
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/shipped"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/setStatus", cartItems, "shipped", "sold");
  },

  /**
   * @name inventory/sold
   * @method
   * @memberof Methods/Inventory
   * @summary Mark inventory as sold
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/sold"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/setStatus", cartItems, "sold", "reserved");
  },

  /**
   * @name inventory/return
   * @method
   * @memberof Methods/Inventory
   * @summary Mark inventory as returned
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/return"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/setStatus", cartItems, "return");
  },

  /**
   * @name inventory/returnToStock
   * @method
   * @memberof Methods/Inventory
   * @summary Mark inventory as return and available for sale
   * @param  {Array} cartItems array of objects Schemas.CartItem
   * @return {undefined}
   */
  "inventory/returnToStock"(cartItems) {
    Schemas.CartItem.validate(cartItems);
    return Meteor.call("inventory/clearStatus", cartItems, "new", "return");
  }
});
