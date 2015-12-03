/**
* pageOrderDetail helpers
*
*/
Template.pageOrderDetail.helpers({
  userProfile: function() {
    var profileId, userProfile;
    profileId = this.userId;
    if (profileId != null) {
      userProfile = Meteor.subscribe("UserProfile", profileId);
      if (userProfile.ready()) {
        return Meteor.users.findOne(profileId);
      }
    }
  },
  orderAge: function() {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function() {
    return this.shipping.shipmentMethod.tracking;
  },
  paymentMethod: function() {
    return this.payment.paymentMethod[0].processor;
  }
});
