/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderStatus: function () {
    if (this.workflow.status === "coreOrderCompleted") {
      return true;
    }
  },
  orders: function (data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    return ReactionCore.Collections.Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
  },
  orderAge: function () {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function () {
    return this.shipping[0].shipmentMethod.tracking;
  },
  shopName: function () {
    let shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }
});
