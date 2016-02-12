Template.impossibleDates.helpers({
  impossibleDates: function () {
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.impossibleShipDate': true
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

Template.impossibleDates.onRendered(function () {
  $('.picker .input-daterange').datepicker({
    startDate: 'today',
    todayBtn: 'linked',
    clearBtn: true,
    calendarWeeks: true,
    autoclose: true,
    todayHighlight: true
  });
});

Template.impossibleDates.events({
  'click .update-rental-dates': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let startDate = new Date($('#' + orderId + ' [name="start"]').val());
    let endDate = new Date($('#' + orderId + ' [name="end"]').val());
    let user = Meteor.user();
    Meteor.call('advancedFulfillment/updateRentalDates', orderId, startDate, endDate, user);
  },
  'click .cancel-order': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/cancelOrder', orderId, userId);
  }
});
