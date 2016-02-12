Template.missingBundleColors.helpers({
  missingBundleInfo: function () {
    return ReactionCore.Collections.Orders.find({
      bundleMissingColor: true
    });
  },
  billingName: function () {
    return this.billing[0].address.fullName;
  },
  billingPhone: function () {
    return this.billing[0].address.phone;
  },
  shippingAddress: function () {
    let address = this.shipping[0].address;
    return address.address1 + ' ' + address.city + ', ' + address.region + ' ' + address.postal;
  }
});

Template.missingBundleColors.events({
  'click .confirm-bundle': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/bundleColorConfirmation', orderId, userId);
  }
});
