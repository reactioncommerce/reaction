/**
* dashboardOrdersList helpers
*
*/
Template.dashboardOrdersList.helpers({
  orders: function(data) {
    if (data.hash.data) {
      return data.hash.data;
    } else {
      return ReactionCore.Collections.Orders.find({}, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
    }
  },
  orderAge: function() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function() {
    return this.shipping.shipmentMethod.tracking;
  },
  shopName: function(shopId) {
    var shop;
    shop = Shops.findOne(this.shopId);
    return shop != null ? shop.name : void 0;
  }
});
