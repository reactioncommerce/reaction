import indexof from "lodash/indexof";
import { Cart } from "/lib/collections";

/**
 * Cart Hooks for Taxes
*/

/**
 * After cart update apply taxes.
 * if items are changed, recalculating taxes
 * we could have done this in the core/cart transform
 * but this way this file controls the events from
 * the core/taxes plugin.
 */
Cart.after.update((userId, cart, fieldNames) => {
  const trigger = ["discount", "billing", "shipping"];

  for (const field of fieldNames) {
    if (indexof(trigger, field) !== -1) {
      Meteor.call("taxes/calculate", cart._id);
    }
  }
});
