/**
 * shops
 * @returns {Object} shop - current shop cursor
 */

Meteor.publish("Shops", function () {
  return ReactionCore.getCurrentShopCursor(this);
});
