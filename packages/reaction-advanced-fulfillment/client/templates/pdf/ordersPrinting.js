Template.advancedFulfillmentOrdersPrint.onCreated(function () {
  Blaze._allowJavascriptUrls();
});

Template.advancedFulfillmentOrdersPrint.helpers({
  humanReadableDate: function (day) {
    // let date = this.advancedFulfillment.shipmentDate;
    return moment(day).format('MMMM Do, YYYY');
  },
  shippingAddress: function (order) {
    if (!order.shipping) { // TODO: Build default message for missing shipping address
      return {};
    }
    return order.shipping[0].address;
  },
  billingAddress: function (order) {
    // TODO: Build default message for missing billing address
    if (!order.billing) {
      return {};
    }
    return order.billing[0].address;
  },
  itemAttr: function (attr) {
    item = _.findWhere(Template.parentData().items, {_id: this._id});
    if (!item) {
      return false;
    }
    return item.variants[attr];
  },
  orders: function () {
    const selectedOrders = JSON.parse(localStorage.selectedOrdersToPrint || '[]');
    return ReactionCore.Collections.Orders.find({
      '_id': {
        $in: selectedOrders
      },
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    });
  }
});
