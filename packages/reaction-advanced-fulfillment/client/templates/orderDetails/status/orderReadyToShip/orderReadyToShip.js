Template.orderReadyToShip.events({
  'click .update-to-shipped': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, 'orderReadyToShip');
  }
});
