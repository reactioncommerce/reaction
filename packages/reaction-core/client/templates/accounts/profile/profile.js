Template.accountProfile.helpers({
  userOrders: function() {
    if (Meteor.user()) {
      return ReactionCore.Collections.Orders.find({
        userId: Meteor.userId()
      }, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
    }
  }
});
