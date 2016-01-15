/**
* pageOrderDetail helpers
*
*/
Template.pageOrderDetail.helpers({
  userProfile: function () {
    if (this.userId !== null) {
      const userProfile = ReactionCore.Collections.
        Accounts.findOne(this.userId);
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
