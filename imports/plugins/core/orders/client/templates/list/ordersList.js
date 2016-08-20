import moment from "moment";
import { Template } from "meteor/templating";
import { Orders, Shops } from "/lib/collections";

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderStatus() {
    if (this.workflow.status === "coreOrderCompleted") {
      return true;
    }
  },
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    return Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
  },
  orderAge() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking() {
    return this.shipping[0].shipmentMethod.tracking;
  },
  shopName() {
    const shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }
});
