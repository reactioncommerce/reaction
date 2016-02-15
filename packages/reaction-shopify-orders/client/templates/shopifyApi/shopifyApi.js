function setOrderCount() {
  Meteor.call('shopifyOrder/count');
}

Template.shopifyApi.helpers({
  count: function () {
    let shopifyOrders = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'}).settings.public;
    if (shopifyOrders) {
      if (shopifyOrders.ordersSinceLastUpdate ||  shopifyOrders.ordersSinceLastUpdate === 0) {
        return shopifyOrders.ordersSinceLastUpdate;
      }
    }
    return  '<em>Calculating.....</em>';
  },
  importing: function () {
    return Session.get('importing');
  }
});

Template.shopifyApi.onRendered(function () {
  setOrderCount();
});

Template.shopifyApi.events({
  'click .updateShopifyOrders': function (event) {
    event.preventDefault();
    // let date = new Date();
    Session.set('importing', true);
    let orderCount = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'}).settings.public.ordersSinceLastUpdate;
    if (orderCount === 0) {
      Session.set('importing', false);
      Alerts.removeSeen();
      return Alerts.add('There are no new orders to update.', 'danger', {
        autoHide: true
      });
    }
    Meteor.call('shopifyOrders/getOrders', function (error, result) {
      if (result) {
        Session.set('importing', false);
      }
    });
    Alerts.removeSeen();
    Alerts.add('Your ' + orderCount + ' Shopify Orders have been saved.', 'success', {
      autoHide: true
    });
    setOrderCount();
    // Session.set('importing', false);
  }
});
