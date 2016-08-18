import moment from "moment";
import { Template } from "meteor/templating";
import { Accounts } from "/lib/collections";

/**
* pageOrderDetail helpers
*
*/
Template.pageOrderDetail.helpers({
  userProfile: function () {
    if (typeof this.userId === "string") {
      const userProfile = Accounts.findOne(this.userId);
      return userProfile.profile;
    }
  },
  orderAge: function () {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function () {
    return this.shipping.shipmentMethod.tracking;
  },
  paymentMethod: function () {
    return this.payment.paymentMethod[0].processor;
  }
});
