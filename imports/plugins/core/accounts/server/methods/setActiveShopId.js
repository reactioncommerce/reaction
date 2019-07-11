import { check } from "meteor/check";
import { Accounts } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name accounts/setActiveShopId
 * @memberof Accounts/Methods
 * @method
 * @param {String} shopId Shop ID to make active for the current user
 * @summary Sets users profile currency
 * @returns {Object} Account document
 */
export default function setActiveShopId(shopId) {
  check(shopId, String);

  const userId = Reaction.getUserId();
  if (userId) {
    Accounts.update({ userId }, {
      $set: {
        "profile.preferences.reaction.activeShopId": shopId
      }
    });

    // Clear the shop ID that is cached on this connection
    Reaction.resetShopId();
  }
}
