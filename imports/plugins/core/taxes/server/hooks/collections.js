import { Cart } from "/lib/collections";
import { Logger } from "/server/api";
/**
 * Taxes Collection Hooks
*/

/**
 * After cart update apply taxes.
 * if items are changed, recalculating taxes
 * we could have done this in the core/cart transform
 * but this way this file controls the events from
 * the core/taxes plugin.
 */
Cart.after.update((userId, cart, fieldNames, modifier) => {
  // adding quantity
  if (modifier.$inc) {
    Logger.debug("incrementing cart - recalculating taxes");
    Meteor.call("taxes/calculate", cart._id);
  }

  // adding new items
  if (modifier.$addToSet) {
    if (modifier.$addToSet.items) {
      Logger.debug("adding to cart - recalculating taxes");
      Meteor.call("taxes/calculate", cart._id);
    }
  }

  // altering the cart shipping
  // or billing address we'll update taxes
  // ie: shipping/getShippingRates
  if (modifier.$set) {
    if (modifier.$set["shipping.$.shipmentMethod"] || modifier.$set["shipping.$.address"]) {
      Logger.debug("updated shipping info - recalculating taxes");
      Meteor.call("taxes/calculate", cart._id);
    }
  }

  // removing items
  if (modifier.$pull) {
    if (modifier.$pull.items) {
      Logger.debug("removing from cart - recalculating taxes");
      Meteor.call("taxes/calculate", cart._id);
    }
  }
});
