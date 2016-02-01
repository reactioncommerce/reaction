/**
 * orderDetail helpers
 *
 * order state tracking, user profile helpers
 *
 * @returns user profile details on orders
 */
Template.orderDetail.onCreated = function () {
  Meteor.subscribe("UserProfile", this.userId);
};

Template.orderDetail.helpers({
  userProfile: function () {
    if (typeof this.userId === "string") {
      const userProfile = ReactionCore.Collections.Accounts.findOne(this.userId);
      if (!userProfile) {
        return {};
      }
      return userProfile.profile;
    }
  },
  orderAge: function () {
    return moment(this.createdAt).fromNow();
  },
  shipmentTracking: function () {
    return this.shipping.shipmentMethod.tracking;
  }
});
