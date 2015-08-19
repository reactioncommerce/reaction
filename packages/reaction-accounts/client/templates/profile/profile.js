


Template.accountProfile.onCreated(function () {
  var self = this;

  this.userHasPassword = ReactiveVar(false);

  Meteor.call('currentUserHasPassword', function(error, result) {
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
        sort: {createdAt: -1},
        limit: 25
      });
    }
  },

  account: function () {
    var account = ReactionCore.Collections.Accounts.findOne()
    console.log(account)
    return account;
  },

  addressBookView: function () {

    var account = ReactionCore.Collections.Accounts.findOne()

    if (account.profile) {
      return 'addressBookGrid';
    }

    return 'addressBookAdd';

  }

});

