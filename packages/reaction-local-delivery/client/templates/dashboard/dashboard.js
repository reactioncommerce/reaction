const timeTable = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'MMM DD, YYYY'
};

function isPickUp(order) {
  if (order.advancedFulfillment.delivered) {
    return true;
  }
  return false;
}

Template.dashboardLocalDelivery.onCreated(function () {
  Session.setDefault('deliveryOrders', []);
  Session.setDefault('selectedDriver', Meteor.userId());
});


Template.dashboardLocalDelivery.helpers({
  deliveryOrders: function () {
    let orders =  ReactionCore.Collections.Orders.find({
      'advancedFulfillment.delivered': {
        $ne: true
      },
      'delivery.deliveryStatus': {
        $nin: ['Assigned to Driver', 'Picked Up']
      }
    }, { sort: {
      'advancedFulfillment.arriveBy': 1,
      'shopifyOrderNumber': 1
    }});
    return orders;
  },
  pickUpOrders: function () {
    let orders =  ReactionCore.Collections.Orders.find({
      'advancedFulfillment.delivered': true,
      'delivery.deliveryStatus': {
        $nin: ['Assigned to Driver', 'Picked Up']
      }
    }, { sort: {
      'advancedFulfillment.shipReturnBy': 1,
      'shopifyOrderNumber': 1
    }});
    return orders;
  },
  inTransitLocalDelivery: function () {
    return Orders.find({
      'delivery.deliveryStatus': {
        $in: ['Assigned to Driver', 'Picked Up']
      }
    });
  },
  allUsers: function () {
    return Meteor.users.find({
      username: {$exists: true}
    });
  },
  deliveryAddress: function () {
    const delivery = this.shipping[0].address;
    return delivery.address1
      + delivery.address2
      + '<br>'
      + delivery.city + ', '
      + delivery.region + ' '
      + delivery.postal;
  },
  deliveryType: function () {
    if (isPickUp(this)) {
      return '<span class="label label-warning">Pickup</span';
    }
    return '<span class="label label-info">Delivery</span';
  },
  whichDate: function () {
    if (isPickUp(this)) {
      return moment(this.advancedFulfillment.shipReturnBy).calendar(null, timeTable);
    }
    return moment(this.advancedFulfillment.arriveBy).calendar(null, timeTable);
  },
  deliverySelected: function () {
    return Session.get('deliveryOrders').indexOf(this._id) !== -1;
  },
  deliveriesSelected: function () {
    return Session.get('deliveryOrders').length > 0;
  },
  numberOfOrders: function () {
    return Session.get('deliveryOrders').length;
  },
  deliveryStatus: function () {
    if (this.delivery) {
      return this.delivery.deliveryStatus;
    }
    return 'Ready for Delivery';
  },
  driverName: function (userId) {
    if (!userId) {
      let history = _.findWhere(this.history, {event: 'orderPickedUp'});
      userId = history.userId;
    }
    return Meteor.users.findOne(userId).username;
  },
  selectedDriver: function () {
    let userId = Session.get('selectedDriver');
    if (userId === Meteor.userId()) {
      return 'my';
    }
    let user = Meteor.users.findOne(userId);
    return user.username + "'s";
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

Template.dashboardLocalDelivery.events({
  'click label .fa-check-square-o, click label .fa-square-o': function (event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const checked = $(event.currentTarget).parent().prev()[0].checked;
    $(event.currentTarget).parent().prev()[0].checked = !checked;
    const _id = $(event.currentTarget).parent().prev().data('id');
    let selectedOrders = Session.get('deliveryOrders');

    if (!checked) {
      selectedOrders.push(_id);
    } else {
      selectedOrders = _.without(selectedOrders, _id);
    }
    Session.set('deliveryOrders', selectedOrders);
  },
  'click .addDeliveriesToMyQueue': function (event) {
    event.preventDefault();
    const orderIds = Session.get('deliveryOrders');
    Meteor.call('localDelivery/addToMyRoute', orderIds, Session.get('selectedDriver'));
    Session.set('deliveryOrders', []);
  },
  'change .driver-select': function (event) {
    event.preventDefault();
    let selectedDriver = event.currentTarget.selectedOptions[0].value;
    Session.set('selectedDriver', selectedDriver);
  }
});
