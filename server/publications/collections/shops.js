import { Reaction } from "/server/api";

/**
 * shops
 * @returns {Object} shop - current shop cursor
 */

Meteor.publish("Shops", function () {
  return Reaction.getCurrentShopCursor();
});
