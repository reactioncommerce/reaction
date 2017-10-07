import moment from "moment";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Orders, Shops } from "/lib/collections";
import { Reaction } from "/client/api";


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
    const targetUserId = Reaction.Router.getQueryParam("userId") || Meteor.userId();
    return Orders.find({ userId: targetUserId }, {
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
    const shippingObject = this.shipping.find((shipping) => {
      return shipping.shopId === Reaction.getShopId();
    });
    return shippingObject.shipmentMethod.tracking;
  },
  shopName() {
    const shop = Shops.findOne(this.shopId);
    return shop !== null ? shop.name : void 0;
  }
});
