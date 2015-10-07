Template.accountProfile.onCreated(function () {
  let self = this;

  this.userHasPassword = ReactiveVar(false);

  Meteor.call("accounts/currentUserHasPassword", function (error, result) {
    self.userHasPassword.set(result);
  });
});

Template.accountProfile.helpers({

  userHasPassword: function () {
    return Template.instance().userHasPassword.get();
  },

  userOrders: function () {
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
  },

  account: function () {
    return ReactionCore.Collections.Accounts.findOne();
  },
  addressBookView: function () {
    let account = ReactionCore.Collections.Accounts.findOne();
    if (account.profile) {
      return "addressBookGrid";
    }
    return "addressBookAdd";
  }
});
