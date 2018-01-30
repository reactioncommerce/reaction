import moment from "moment";
import { Template } from "meteor/templating";
import { Accounts } from "/lib/collections";

/**
* pageOrderDetail helpers
*
*/
Template.pageOrderDetail.helpers({
  userProfile() {
    if (typeof this.userId === "string") {
      const userProfile = Accounts.findOne(this.userId);
      return userProfile.profile;
    }
  },
  orderAge() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking() {
    return this.shipping.shipmentMethod.tracking;
  },
  paymentMethod() {
    return this.payment.paymentMethod[0].processor;
  }
});
