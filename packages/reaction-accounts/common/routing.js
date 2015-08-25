
Router.map(function() {

  this.route('accounts', {
    controller: ShopSettingsController,
    path: '/dashboard/settings/accounts',
    template: 'accountsDashboard'
  });

  this.route('signIn', {
    controller: ShopController,
    path: 'signin',
    template: 'loginForm'
  });

  // account profile
  this.route('account/profile', {
    controller: ShopController,
    path: 'account/profile',
    template: 'accountProfile',

    subscriptions: function () {
      this.subscribe('AccountOrders', Session.get('sessionId'), Meteor.userId())
    },

    data: function () {
      if (this.ready()) {
        if (Orders.findOne() || Meteor.userId()) {
          // if subscription has results or Meteor userId
          return ReactionCore.Collections.Orders.find({}, {sort: { createdAt: -1 }})
        } else {
          this.render('unauthorized');
        }
      } else {
        this.render('loading');
      }
    }

  });


});
