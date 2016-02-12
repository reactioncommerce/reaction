localDeliveryController = ShopController.extend({
  onBeforeAction: function () {
    const localDelivery = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-local-delivery'
    });
    if (!localDelivery.enabled) {
      this.render('notFound');
    } else {
      if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/local-delivery', 'reaction-local-delivery'])) {
        this.render("layoutHeader", {
          to: "layoutHeader"
        });
        this.render("layoutFooter", {
          to: "layoutFooter"
        });
        this.render("unauthorized");
      } else {
        this.next();
      }
    }
  }
});

Router.route('dashboard/local-delivery', {
  controller: localDeliveryController,
  path: '/dashboard/local-delivery',
  template: 'dashboardLocalDelivery',
  subscriptions: function () {
    this.subscribe('getoutfittedEmployees');
    this.subscribe('localDeliveryOrders');
    return this.subscribe('localOrders');
  }
});

Router.route('dashboard/my-route', {
  controller: localDeliveryController,
  template: 'myRoute',
  name: 'myRoute',
  subscriptions: function () {
    return this.subscribe('myLocalDeliveryOrders', Meteor.userId());
  }
});

