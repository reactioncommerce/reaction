advancedFulfillmentController = ShopController.extend({
  onBeforeAction: function () {
    const advancedFulfillment = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-advanced-fulfillment'
    });
    if (!advancedFulfillment.enabled) {
      this.render('notFound');
    } else {
      if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'])) {
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
/*
 * AF Print Controller
 */

let advancedFulfillmentPrintController = RouteController.extend({
  onBeforeAction: function () {
    if (!ReactionCore.hasPermission(['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'])) {
      this.render("unauthorized");
    } else {
      this.next();
    }
  }
});

Router.route('dashboard/advanced-fulfillment', {
  name: 'dashboard/advanced-fulfillment',
  path: 'dashboard/advanced-fulfillment',
  template: 'fulfillmentOrders',
  controller: 'ShopAdminController',
  waitOn: function () {
    return this.subscribe('shippingOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'startTime': {$ne: undefined}
    }, {
      sort: {
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'shopifyOrderNumber': 1
      }
    }

    )};
  }
});

Router.route('dashboard/advanced-fulfillment/picker', {
  name: 'advancedFulfillment.picker',
  path: 'dashboard/advanced-fulfillment/picker',
  template: 'advancedFulfillment.picker.search',
  controller: 'ShopAdminController',
  waitOn: function () {
    return this.subscribe('searchOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/shipping', {
  name: 'allShipping',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('shippingOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'items': {$ne: []},
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'startTime': {$ne: undefined}
    }, {
      sort: {
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'shopifyOrderNumber': 1
      }
    }

    )};
  }
});

Router.route('dashboard/advanced-fulfillment/shipping/:date', {
  name: 'dateShipping',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('shippingOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      },
      'startTime': {$ne: undefined}
    }, {
      sort: {
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'shopifyOrderNumber': 1
      }
    })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/local-deliveries', {
  name: 'allLocalDeliveries',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'items': {$ne: []},
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    }, {
      sort: {
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'shopifyOrderNumber': 1
      }
    }

    )};
  }
});

Router.route('dashboard/advanced-fulfillment/local-delivery/:date', {
  name: 'dateLocalDelivery',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.localDelivery': true,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'advancedFulfillment.shipmentDate': {
        $gte: new Date(dayStart),
        $lte: new Date(dayEnd)
      }
    }, {
      sort: {
        shopifyOrderNumber: 1
      }
    })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/order/:_id', {
  name: 'orderDetails',
  template: 'orderDetails',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('advancedFulfillmentOrder', this.params._id);
  },
  data: function () {
    return ReactionCore.Collections.Orders.findOne(this.params._id);
  }
});

Router.route('dashboard/advanced-fulfillment/order-queue', {
  name: 'orderQueue',
  template: 'orderQueue',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('userOrderQueue');
  }
});

Router.route('dashboard/advanced-fulfillment/order/pdf/:_id', {
  name: 'advancedFulfillmentPDF',
  controller: advancedFulfillmentPrintController,
  path: 'dashboard/advanced-fulfillment/order/pdf/:_id',
  template: 'advancedFulfillmentPDF',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('advancedFulfillmentOrder', this.params._id);
  },
  data: function () {
    if (this.ready()) {
      return ReactionCore.Collections.Orders.findOne({
        _id: this.params._id
      });
    }
  }
});


Router.route('dashboard/advanced-fulfillment/order/local-delivery-label-pdf/:_id', {
  name: 'localDeliveryLabelPDF',
  controller: advancedFulfillmentPrintController,
  path: 'dashboard/advanced-fulfillment/order/local-delivery-label-pdf/:_id',
  template: 'localDeliveryLabelPDF',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('advancedFulfillmentOrder', this.params._id);
  },
  data: function () {
    if (this.ready()) {
      return ReactionCore.Collections.Orders.findOne({
        _id: this.params._id
      });
    }
  }
});

Router.route('dashboard/advanced-fulfillment/orders/pdf/date/:date', {
  name: 'orders.printAllForDate',
  controller: advancedFulfillmentPrintController,
  path: 'dashboard/advanced-fulfillment/orders/pdf/date/:date',
  template: 'advancedFulfillmentOrdersPrint',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('ordersShippingOnDate', this.params.date);
  },
  data: function () {
    let day = this.params.date;
    let startOfDay = moment(day, 'MM-DD-YYYY').startOf('day').toDate();
    let endOfDay = moment(day, 'MM-DD-YYYY').endOf('day').toDate();
    return {
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: AdvancedFulfillment.orderActive
        },
        'advancedFulfillment.shipmentDate': {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      })
    };
  }
});

Router.route('dashboard/advanced-fulfillment/orders/pdf/selected', {
  name: 'orders.printSelected',
  controller: advancedFulfillmentPrintController,
  path: 'dashboard/advanced-fulfillment/orders/pdf/selected',
  template: 'advancedFulfillmentOrdersPrint',
  onBeforeAction() {
    this.layout('print');
    return this.next();
  },
  subscriptions: function () {
    this.subscribe('selectedOrders', JSON.parse(localStorage.getItem('selectedOrdersToPrint'))); // TODO: Optimize this subscription, migrate it to template subscription
  }
});

Router.route('dashboard/advanced-fulfillment/orders/status/:status', {
  name: 'orderByStatus',
  template: 'fulfillmentOrders',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('ordersByStatus', this.params.status);
  },
  data: function () {
    let status = this.params.status;
    return {
      status: this.params.status,
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': status
      }, {
        sort: {
          'advancedFulfillment.shipmentDate': 1,
          'advancedFulfillment.localDelivery': 1,
          'advancedFulfillment.rushDelivery': 1,
          'shopifyOrderNumber': 1
        }
      })};
  },
  onBeforeAction: function () {
    let status = this.params.status;
    let viableStatuses = [
      'orderCreated',
      'orderPrinted',
      'orderPicking',
      'orderPicked',
      'orderPacking',
      'orderPacked',
      'orderReadyToShip',
      'orderShipped',
      'orderReturned',
      'orderCompleted',
      'orderIncomplete'
    ];
    let validStatus = _.contains(viableStatuses, status);
    if (validStatus) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/returns', {
  name: 'returns',
  template: 'returnOrders',
  controller: advancedFulfillmentController,
  waitOn: function () {
    return this.subscribe('afReturnOrders');
  },
  data: function () {
    return {orders: ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': {
        $in: [
          'orderShipped',
          'orderReturned'
        ]
      }
    }, {
      sort: {
        'advancedFulfillment.returnDate': 1,
        'shopifyOrderNumber': 1
      }
    })};
  }
});

Router.route('dashboard/advanced-fulfillment/returns/:date', {
  name: 'dateReturning',
  controller: advancedFulfillmentController,
  template: 'fulfillmentOrders',
  waitOn: function () {
    return this.subscribe('afOrders');
  },
  data: function () {
    let rawDate = this.params.date;
    let dayStart = moment(rawDate, 'MM-DD-YYYY').startOf('day')._d;
    let dayEnd = moment(rawDate, 'MM-DD-YYYY').endOf('day')._d;
    return {
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.workflow.status': {
          $in: [
            'orderShipped',
            'orderReturned'
          ]
        },
        'advancedFulfillment.returnDate': {
          $gte: new Date(dayStart),
          $lte: new Date(dayEnd)
        }
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      })};
  },
  onBeforeAction: function () {
    let date = this.params.date;
    let validDate = moment(date, 'MM-DD-YYYY').isValid();
    if (validDate) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/missing', {
  name: 'missing',
  controller: advancedFulfillmentController,
  template: 'missingDamaged',
  waitOn: function () {
    return this.subscribe('ordersWithMissingItems');
  },
  data: function () {
    return {
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.items.workflow.status': 'missing'
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      })
    };
  }
});

Router.route('dashboard/advanced-fulfillment/damaged', {
  name: 'damaged',
  controller: advancedFulfillmentController,
  template: 'missingDamaged',
  waitOn: function () {
    return this.subscribe('ordersWithDamagedItems');
  },
  data: function () {
    return {
      orders: ReactionCore.Collections.Orders.find({
        'advancedFulfillment.items.workflow.status': 'damaged'
      }, {
        sort: {
          shopifyOrderNumber: 1
        }
      })
    };
  }
});

Router.route('dashboard/advanced-fulfillment/search', {
  name: 'searchOrders',
  controller: advancedFulfillmentController,
  template: 'searchOrders',
  waitOn: function () {
    return this.subscribe('searchOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/update-order/:_id', {
  name: 'updateOrder',
  controller: advancedFulfillmentController,
  template: 'updateOrder',
  waitOn: function () {
    this.subscribe('afProducts');
    return this.subscribe('advancedFulfillmentOrder', this.params._id);
  },
  data: function () {
    return ReactionCore.Collections.Orders.findOne({ _id: this.params._id});
  },
  onBeforeAction: function () {
    let validOrder = ReactionCore.Collections.Orders.findOne({ _id: this.params._id});
    if (validOrder) {
      this.next();
    } else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/update-order/:orderId/:itemId', {
  name: 'updateOrderItem',
  controller: advancedFulfillmentController,
  template: 'updateOrderItem',
  waitOn: function () {
    this.subscribe('afProducts');
    return this.subscribe('advancedFulfillmentOrder', this.params.orderId);
  },
  data: function () {
    return ReactionCore.Collections.Orders.findOne({ _id: this.params.orderId});
  },
  onBeforeAction: function () {
    let validOrder = ReactionCore.Collections.Orders.findOne({ _id: this.params.orderId});
    if (validOrder) {
      this.next();
    }  else {
      this.render('notFound');
    }
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/impossible-dates', {
  name: 'impossibleDates',
  controller: advancedFulfillmentController,
  template: 'impossibleDates',
  waitOn: function () {
    return this.subscribe('custServOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-rental-dates', {
  name: 'missingRentalDates',
  controller: advancedFulfillmentController,
  template: 'missingRentalDates',
  waitOn: function () {
    return this.subscribe('custServOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-item-details', {
  name: 'missingItemDetails',
  controller: advancedFulfillmentController,
  template: 'missingItemDetails',
  waitOn: function () {
    return this.subscribe('custServOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/missing-bundle-colors', {
  name: 'missingBundleColors',
  controller: advancedFulfillmentController,
  template: 'missingBundleColors',
  waitOn: function () {
    return this.subscribe('custServOrders');
  }
});

Router.route('dashboard/advanced-fulfillment/customer-service/non-warehouse-orders', {
  name: 'nonWarehouseOrders',
  controller: advancedFulfillmentController,
  template: 'nonWarehouseOrders',
  waitOn: function () {
    return this.subscribe('nonWarehouseOrders');
  }
});
