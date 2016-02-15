function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.updateOrder.onCreated(function () {
  this.subscribe('afProducts');
});

Template.updateOrder.onRendered(function () {
  const orderId = Router.current().params._id;
  Session.setDefault('cancel-order-' + orderId, false);
  $('.picker .input-daterange').datepicker({
    startDate: 'today',
    todayBtn: 'linked',
    clearBtn: true,
    calendarWeeks: true,
    autoclose: true,
    todayHighlight: true
  });
});

Template.updateOrder.helpers({
  afItems: function () {
    return this.advancedFulfillment.items;
  },
  colorOptions: function (item) {
    let productId = item.productId;
    let product = ReactionCore.Collections.Products.findOne(productId);
    if (product) {
      return product.colors;
    }
  },
  sizeOptions: function (item) {
    let productId = item.productId;
    let product = ReactionCore.Collections.Products.findOne(productId);
    let selectedColor = Session.get('colorSelectorFor-' + item._id);
    let variantsWithSelectedColor = _.where(product.variants, {color: selectedColor});
    return _.map(variantsWithSelectedColor, function (variant) {
      return {
        size: variant.size,
        _id: variant._id
      };
    });
  },
  sizeAndColorSelected: function (item) {
    let itemId = item._id;
    let color = Session.get('colorSelectorFor-' + itemId);
    let size = Session.get('sizeSelectorFor-' + itemId);
    if (color && size) {
      return true;
    }
    return false;
  },
  color: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.color;
    }
  },
  size: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.size;
    }
  },
  colorAndSize: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      if (orderItem.variants.size &&  orderItem.variants.color) {
        return true;
      }
      return false;
    }
    return false;
  },
  readyToSelectSize: function (item) {
    let itemId = item._id;
    let session = Session.get('colorSelectorFor-' + itemId);
    if (session) {
      return true;
    }
    return false;
  },
  addingItems: function () {
    let addingItems = Session.get('addItems');
    return addingItems || false;
  },
  address: function (param) {
    return this.shipping[0].address[param];
  },
  cancelOrder: function () {
    const orderId = this._id;
    return Session.get('cancel-order-' + orderId);
  },
  userName: function () {
    let userName = Meteor.user().username || Meteor.user().emails[0].address || 'Guest';
    return userName;
  }
});


Template.updateOrder.events({
  'change .color-selector': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let selectedColor = event.target.value;
    Session.set('sizeSelectorFor-' + itemId, undefined);
    Session.set('colorSelectorFor-' + itemId, selectedColor);
  },
  'change .size-selector': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let selectedSize = event.target.value;
    Session.set('sizeSelectorFor-' + itemId, selectedSize);
  },
  'click .save-item': function (event) {
    event.preventDefault();
    let itemId = event.target.dataset.id;
    let productId = event.target.dataset.productId;
    let newVariantId = Session.get('sizeSelectorFor-' + itemId);
    let order = this;
    let user = Meteor.user();
    Meteor.call('advancedFulfillment/updateItemsColorAndSize', order, itemId, productId, newVariantId, user);
  },
  'click .add-new-item': function (event) {
    event.preventDefault();
    let addingItems = !Session.get('addItems') || false;
    Session.set('addItems', addingItems);
  },
  'click .update-rental-dates': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let startDate = new Date($('#' + orderId + ' [name="start"]').val());
    let endDate = new Date($('#' + orderId + ' [name="end"]').val());
    let user = Meteor.user();
    Meteor.call('advancedFulfillment/updateRentalDates', orderId, startDate, endDate, user);
    Alerts.removeSeen();
    Alerts.add('Rental Dates updated', 'success', {
      autoHide: true
    });
  },
  'submit #updateShippingAddressForm': function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    let address = this.shipping[0].address;
    address.fullName = form.shippingName.value;
    address.address1 = form.shippingAddress1.value;
    address.address2 = form.shippingAddress2.value;
    address.city = form.shippingCity.value;
    address.postal = form.shippingPostal.value;
    address.region = form.shippingRegion.value;
    if (address.fullName && address.address1 && address.city && address.postal && address.region) {
      Meteor.call('advancedFulfillment/updateShippingAddress', this._id, address);
      Alerts.removeSeen();
      Alerts.add('Shipping Address Updated', 'success', {autoHide: true});
    } else {
      Alerts.removeSeen();
      Alerts.add('All fields required except Address 2', 'danger');
    }
  },
  'submit #updateContactInformationForm': function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.contactEmail.value;
    const phone = form.contactPhone.value;
    if (email && phone) {
      Meteor.call('advancedFulfillment/updateContactInformation', this._id, phone, email);
      Alerts.removeSeen();
      Alerts.add('Contact Information Updated', 'success', {autoHide: true});
    } else {
      Alerts.removeSeen();
      Alerts.add('Phone and Email are both required', 'danger');
    }
  },
  'click .confirm-to-cancel': function (event) {
    event.preventDefault();
    const orderId = this._id;
    Session.set('cancel-order-' + orderId, !Session.get('cancel-order-' + orderId));
  },
  'click .cancel-order': function (event) {
    event.preventDefault();
    const orderId = this._id;
    Meteor.call('advancedFulfillment/cancelOrder', orderId, Meteor.userId());
    Alerts.removeSeen();
    Alerts.add('Order #' + this.shopifyOrderNumber + ' has been cancelled', 'info', {
      autoHide: true
    });
    Session.set('cancel-order-' + orderId, !Session.get('cancel-order-' + orderId));
  }
});
