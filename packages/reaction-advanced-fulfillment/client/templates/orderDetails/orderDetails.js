function getIndexBy(array, name, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][name] === value) {
      return i;
    }
  }
}

function labelMaker(word, bootStrapColor = 'primary') {
  return '<span class="label label-' + bootStrapColor + '">' + word + '</span> ';
}

Template.orderDetails.helpers({
  currentStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let generalTemplates = [
      'orderCreated',
      'orderPrinted',
      'orderPicked',
      'orderShipped',
      'orderIncomplete',
      'orderCompleted',
      'nonWarehouseOrder'
    ];
    // let generalTemplates = AdvancedFulfillment.assignmentStatuses;
    let valid = _.contains(generalTemplates, currentStatus);
    if (valid) {
      return 'defaultStatus';
    }
    return currentStatus;
  },
  status: function () {
    return this.advancedFulfillment.workflow.status;
  },
  actualTransitTime: function () {
    let transitTime = this.advancedFulfillment.transitTime - 1;
    return transitTime > 0 ? transitTime : 0;
  },
  humanStatus: function () {
    return AdvancedFulfillment.humanOrderStatuses[this.advancedFulfillment.workflow.status];
  },
  actionStatus: function () {
    return AdvancedFulfillment.humanActionStatuses[this.advancedFulfillment.workflow.status];
  },
  orderCreated: function () {
    let valid = this.advancedFulfillment.workflow.status === 'orderCreated';
    return valid;
  },
  nextStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let options = AdvancedFulfillment.workflow;
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
  },
  readyForAssignment: function () {
    let status = this.advancedFulfillment.workflow.status;
    let updateableStatuses = AdvancedFulfillment.assignmentStatuses;
    return _.contains(updateableStatuses, status);
  },
  shopifyOrder: function () {
    if (this.shopifyOrderNumber) {
      return true;
    }
    return false;
  },
  shippingTo: function () {
    return this.shipping[0].address.fullName;
  },
  shippingAddress1: function () {
    if (this.shipping[0].address2) {
      return this.shipping[0].address.address1 + ' ' + this.shipping[0].address2;
    }
    return this.shipping[0].address.address1;
  },
  shippingAddress2: function () {
    return this.shipping[0].address.address2;
  },
  city: function () {
    return this.shipping[0].address.city;
  },
  state: function () {
    return this.shipping[0].address.region;
  },
  zipcode: function () {
    return this.shipping[0].address.postal;
  },
  contactInfo: function () {
    return this.email || 'Checked Out As Guest';
  },
  phoneNumber: function () {
    return this.shipping[0].address.phone || '';
  },
  printLabel: function () {
    let status = this.advancedFulfillment.workflow.status;
    if (status === 'orderFulfilled') {
      return true;
    }
    return false;
  },
  currentlyAssignedUser: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let assignedUser = history.userId;
    return Meteor.users.findOne(assignedUser).username;
  },
  currentlyAssignedTime: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    let assignedTime = history.updatedAt;
    return assignedTime;
  },
  noItemsToPick: function () {
    let numberOfItems = this.advancedFulfillment.items.length;
    let status = this.advancedFulfillment.workflow.status;
    if (status !== 'nonWarehouseOrder') {
      return numberOfItems === 0;
    }
    return false;
  },
  myOrdersInCurrentStep: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let history = _.findWhere(this.history, {event: currentStatus});
    if (!history) {
      return false;
    }
    // TODO: Maybe change to cursor?
    let orders = Orders.find({
      'history.userId': Meteor.userId(),
      'history.event': currentStatus,
      'advancedFulfillment.workflow.status': currentStatus
    }).fetch();
    let myOrder = history.userId === Meteor.userId();
    let myOrders = {};
    let currentOrder = getIndexBy(orders, '_id', this._id);
    let nextOrder = myOrder ? orders[currentOrder - 1] : undefined;
    let prevOrder = myOrder ? orders[currentOrder + 1] : undefined;
    myOrders.nextOrderId = nextOrder ? nextOrder._id : undefined;
    myOrders.hasNextOrder = nextOrder ? true : false;
    myOrders.hasPrevOrder = prevOrder ? true : false;
    myOrders.prevOrderId = prevOrder ? prevOrder._id : undefined;
    myOrders.count = orders.length;
    return myOrders;
  },
  hasNonPickableItems: function () {
    const af = this.advancedFulfillment;
    if (!af.damageCoverage) {
      return false;
    }
    const damageCoverage = af.damageCoverage.packages.qty > 0 || af.damageCoverage.products.qty > 0;
    if (af.skiPackagesPurchased || af.kayakRental || af.other || damageCoverage) {
      return true;
    }
    return false;
  },
  hasShippingInfo: function () {
    return this.advancedFulfillment.shippingHistory && this.advancedFulfillment.workflow.status === 'orderShipped';
  },
  hasCustomerServiceIssue: function () {
    let anyIssues = [
      this.infoMissing,
      this.itemMissingDetails,
      this.bundleMissingColor,
      this.advancedFulfillment.impossibleShipDate
    ];
    return _.some(anyIssues);
  },
  typeofIssue: function () {
    let issues = '';
    if (this.infoMissing) {
      issues += labelMaker('Missing Rental Dates');
    }
    if (this.itemMissingDetails) {
      issues += labelMaker('Items Missing Color and Size');
    }
    if (this.bundleMissingColor) {
      issues += labelMaker('Bundle Packages Were Assigned Default Color');
    }
    if (this.bundleMissingColor) {
      issues += labelMaker('Arrive By Date is Impossible to Fulfill');
    }
    return '<h4>' + issues + '</h4>';
  }
});

Template.orderDetails.onRendered(function () {
  let orderId = Router.current().params._id;
  $('#barcode').barcode(orderId, 'code128', {
    barWidth: 2,
    barHeight: 150,
    moduleSize: 15,
    showHRI: true,
    fontSize: 14
  });
});

Template.orderDetails.events({
  'click .advanceOrder': function (event) {
    event.preventDefault();
    let currentStatus = this.advancedFulfillment.workflow.status;
    let orderId = this._id;
    let userId = Meteor.userId();
    if (currentStatus === 'orderShipped') {
      Meteor.call('advancedFulfillment/updateAllItemsToSpecificStatus', this, 'shipped');
    }
    Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, currentStatus);
  },
  'submit .add-notes': function (event) {
    event.preventDefault();
    let notes = event.currentTarget.notes.value;
    if (notes) {
      let order = this;
      let user = Meteor.user();
      if (user) {
        user = user.username;
      } else {
        user = user.emails[0].address;
      }
      Meteor.call('advancedFulfillment/updateOrderNotes', order, notes, user);
      Alerts.removeSeen();
      Alerts.add('Order Note Added', 'success', {
        autoHide: true
      });
      event.currentTarget.notes.value = '';
    } else {
      Alerts.removeSeen();
      Alerts.add('Order Notes Cannot Be Blank', 'danger', {
        autoHide: true
      });
    }
  },
  'click .print-invoice': function () {
    let orderId = event.target.dataset.orderId;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/printInvoice', orderId, userId);
  },
  'click .noWarehouseItems': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/nonWarehouseOrder', orderId, userId);
  }
});
