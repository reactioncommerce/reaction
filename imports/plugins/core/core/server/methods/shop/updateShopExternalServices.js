import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Packages } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
 * @name shop/updateShopExternalServices
 * @method
 * @memberof Shop/Methods
 * @description On submit OpenExchangeRatesForm handler
 * @summary we need to rerun fetch exchange rates job on every form submit,
 * that's why we update autoform type to "method-update"
 * @param {Object} details An object with _id and modifier props
 * @fires Collections.Packages#update
 * @todo This method fires Packages collection, so maybe someday it could be moved to another file
 * @returns {undefined}
 */
export default function updateShopExternalServices(details) {
  check(details, {
    _id: String,
    modifier: Object // actual schema validation happens below
  });

  const { _id, modifier } = details;
  Schemas.CorePackageConfig.validate(modifier, { modifier: true });

  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();

  Packages.update(_id, modifier);
}
