Meteor.startup(function () {
  Mapbox.load();
});
Template.myRoute.onRendered(function () {
  Session.setDefault('mapCenter', [39.6286407, -106.0475974]);
  let info = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-local-delivery'
  });

  let geoJson = Orders.find({
    'delivery.delivererId': Meteor.userId()
  }).map(function (order) {
    return order.delivery.geoJson;
  });
  this.autorun(function () {
    if (Mapbox.loaded()) {
      L.mapbox.accessToken = info.settings.mapbox.key;
      let map = L.mapbox.map('map', info.settings.mapbox.id)
      .setView(Session.get('mapCenter'), 10)
      .featureLayer.setGeoJSON(geoJson);
    }
  });
});

Template.myRoute.helpers({
  myDeliveries: function () {
    const userId = Meteor.userId();
    return Orders.find({
      'delivery.delivererId': userId
    });
  },
  isPickUp: function () {
    if (this.delivery.pickUp) {
      return 'Pick Up';
    }
    return 'Delivery';
  },
  deliverButtonColor: function () {
    if (this.delivery.pickUp) {
      return 'warning';
    }
    return 'info';
  },
  actionable: function () {
    const actionableStatuses = 'Assigned to Driver';
    return this.delivery.deliveryStatus === actionableStatuses;
  },
  contact: function () {
    return this.shipping[0].address.fullName;
  },
  phone: function () {
    let ship = this.shipping[0].address.phone;
    let bill = this.billing[0].address.phone;
    if (ship === bill) {
      return '# ' + ship;
    }
    return 'Shipping # ' + ship + ' | Billing # ' + bill;
  }
});

Template.myRoute.events({
  'click .deliveryUpdate': function (event) {
    event.preventDefault();
    const order = this;
    const userId = Meteor.userId();
    Meteor.call('localDelivery/updateLocalDelivery', order, userId);
  },
  'click .route-completed': function (event) {
    event.preventDefault();
    let orders = Orders.find().fetch();
    let orderIds = _.map(orders, function (order) {
      return order._id;
    });
    Meteor.call('localDelivery/updateMyDeliveries', orderIds, Meteor.userId());

  }
});
