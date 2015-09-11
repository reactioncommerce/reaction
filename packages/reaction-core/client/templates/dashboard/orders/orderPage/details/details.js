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
  orderStateHelper: function() {
    switch (this.workflow.status) {
      case 'orderCreated':
        return Template.stateHelperTracking;
      case 'shipmentTracking':
        return Template.spinner;
      case 'shipmentPrepare':
        return Template.stateHelperDocuments;
      case 'shipmentPacking':
        return Template.stateHelperPacking;
      case 'processPayment':
        return Template.stateHelperPayment;
      case 'shipmentShipped':
        return Template.workflowhipped;
      case 'orderCompleted':
        return Template.stateHelperCompleted;
    }
  },
  paymentMethod: function() {
    return this.payment.paymentMethod[0].processor;
  }
});
