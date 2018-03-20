import { Meteor } from "meteor/meteor";
import { Hooks } from "/server/api";

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

Hooks.Events.add("afterCartUpdateCalculateTaxes", (cartId) => {
  Meteor.call("taxes/calculate", cartId);
});
