import { Cart } from "/lib/collections";
import { Logger } from "/server/api";

/**
* Discounts Collection Hooks
* @type {Object}
* @desc After cart update apply discounts.
* if items are changed, recalculating discounts
* we could have done this in the core/cart transform
* but this way this file controls the events from
* the core/discounts plugin.
* @todo just move so a single Hook.event and move all the
* cart hooks to a single location.
*/
Cart.after.update((userId, cart, fieldNames, modifier) => {
  // adding quantity
  if (modifier.$inc) {
    Logger.debug("incrementing cart - recalculating discounts");
    Meteor.call("discounts/calculate", cart._id);
  }

  // adding new items
  if (modifier.$addToSet) {
    if (modifier.$addToSet.items) {
      Logger.debug("adding to cart - recalculating discounts");
      Meteor.call("discounts/calculate", cart._id);
    }
  }

  // altering the cart shipping
  // or billing address we'll update discounts
  // ie: shipping/getShippingRates
  if (modifier.$set) {
    if (modifier.$set["shipping.$.shipmentMethod"] || modifier.$set["shipping.$.address"]) {
      Logger.debug("updated shipping info - recalculating discounts");
      Meteor.call("discounts/calculate", cart._id);
    }
  }

  // removing items
  if (modifier.$pull) {
    if (modifier.$pull.items) {
      Logger.debug("removing from cart - recalculating discounts");
      Meteor.call("discounts/calculate", cart._id);
    }
  }
});
