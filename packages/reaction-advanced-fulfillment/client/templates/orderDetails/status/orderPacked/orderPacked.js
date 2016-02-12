Template.orderPacked.onCreated(function () {
  Session.setDefault('updateShopifyFulfillment', true);
});

Template.orderPacked.helpers({
  shippingInfo: function () {
    let shippingInfo = this.shipping[0].address;
    let afShipping = {};
    afShipping.fullName = shippingInfo.fullName;
    afShipping.address1 = shippingInfo.address1;
    afShipping.address2 = shippingInfo.address2;
    afShipping.city = shippingInfo.city;
    afShipping.state = shippingInfo.region;
    afShipping.zipcode = shippingInfo.postal;
    afShipping.phone = shippingInfo.phone;
    return afShipping;
  },
  localDelivery: function () {
    let shipping = this.shipping[0];
    let zipcode = shipping.address.postal;
    return _.contains(AdvancedFulfillment.localDeliveryZipcodes, zipcode);
  },
  updatedShopifyFulfillmentStatus: function () {
    return Session.equals('updateShopifyFulfillment', true);
  }
});

Template.orderPacked.events({
  'click .local-delivery': function (event) {
    let order = this;
    let currentItemStatus = 'packed';
    let status = this.advancedFulfillment.workflow.status;
    let userId = Meteor.userId();
    let shopifyOrderId = this.shopifyOrderId;
    Meteor.call('advancedFulfillment/updateAllItems', order, currentItemStatus);
    Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, userId, status);
    if (Session.get('updateShopifyFulfillment')) {
      Meteor.call('advancedFulfillment/updatedShopifyFulfillmentStatus', shopifyOrderId, order, userId);
    }
  },
  'click .shopifyFulfillmentUpdater': function (event) {
    event.preventDefault();
    Session.set('updateShopifyFulfillment', !Session.get('updateShopifyFulfillment'));
  }
});
