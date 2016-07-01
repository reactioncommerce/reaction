import moment from "moment";
import { Accounts } from "/lib/collections";
import { Template } from "meteor/templating";

/**
 * orderDetail helpers
 *
 * order state tracking, user profile helpers
 *
 * @returns {undefined} user profile details on orders
 */
Template.orderDetail.onCreated(function () {
  this.subscribe("UserProfile", this.userId);
});

Template.orderDetail.helpers({
  userProfile: function () {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      if (typeof this.userId === "string") {
        const userProfile = Accounts.findOne(this.userId);
        if (!userProfile) {
          return {};
        }
        return userProfile.profile;
      }
    }
  },
  orderAge: function () {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function () {
    return this.shipping.shipmentMethod.tracking;
  }
});
