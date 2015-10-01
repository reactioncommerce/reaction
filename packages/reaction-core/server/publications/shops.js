Shops = ReactionCore.Collections.Shops;
/**
* shops
*  @returns {Cursor} shop - current shop
*/

Meteor.publish('Shops', function() {
  return ReactionCore.getCurrentShopCursor(this);
});
