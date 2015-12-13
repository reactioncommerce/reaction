Template.coreOrderShippingInvoice.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;
  template.refunds = new ReactiveVar([]);
  template.refundAmount = new ReactiveVar(0.00);

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId);
    if (template.order) {
      let paymentMethod = template.order.billing[0].paymentMethod;
      Meteor.call("orders/refunds/list", paymentMethod, (error, result) => {
        if (!error) {
          template.refunds.set(result);
        }
      });
    }
  });
});

Template.coreOrderShippingInvoice.onRendered(() => {
  let template = Template.instance();
  let paymentMethod = template.order.billing[0].paymentMethod;
  let refunds = Template.instance().refunds.get();
  const currency = ReactionCore.Locale.currency;

  const lessAmount = _.reduce(refunds, (memo, refund) => {
    return memo - Math.abs(refund.amount);
  }, paymentMethod.amount);

  if (currency) {
    $("input[name=refund_amount]").autoNumeric({
      aSep: currency.thousand,
      dGroup: currency.grouping,
      aDec: currency.decimal,
      vMax: lessAmount
    });
  }
});

/**
 * coreOrderAdjustments events
 */
Template.coreOrderShippingInvoice.events({

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form[name=capture]": (event, template) => {
    event.preventDefault();

    let order = template.order;
    let discount = parseFloat(event.target.discount_amount.value) || 0;
    Meteor.call("orders/approvePayment", order, discount, (error) => {
      if (error) {
        // Show error
      }
    });
  },

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form[name=refund]": (event, template) => {
    event.preventDefault();

    const order = template.order;
    const refund = accounting.unformat(event.target.refund_amount.value) || 0;
    const paymentMethod = order.billing[0].paymentMethod;

    if (confirm(`Apply refund of ${refund} to this order?`)) {
      Meteor.call("orders/refunds/create", order._id, paymentMethod, refund, (error) => {
        if (error) {
          // Show error
        }

        event.target.refund_amount.value = "";
      });
    }
  },

  "click [data-event-action=makeAdjustments]": (event, template) => {
    event.preventDefault();

    Meteor.call("orders/makeAdjustmentsToInvoice", template.order);
  },

  "click [data-event-action=capturePayment]": (event) => {
    event.preventDefault();

    let template = Template.instance();

    Meteor.call("orders/capturePayments", template.order._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", template.order._id);
  },

  "change input[name=refund_amount]": (event, template) => {
    template.refundAmount.set(accounting.unformat(event.target.value));
  }
});


/**
 * coreOrderShippingInvoice helpers
 */
Template.coreOrderShippingInvoice.helpers({
  refundAmount() {
    return Template.instance().refundAmount;
  },
  /**
   * Discount
   * @return {Number} current discount amount
   */
  invoice() {
    let template = Template.instance();
    let order = template.order;

    return order.billing[0].invoice;
  },

  money(amount) {
    return ReactionCore.Currency.formatNumber(amount);
  },

  currencySymbol() {
    return "$";
    // return ReactionCore.Locale.currency.symbol
  },

  disabled() {
    let template = Template.instance();
    let status = template.order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return "disabled";
    }

    return "";
  },

  paymentPendingApproval() {
    let template = Template.instance();
    let status = template.order.billing[0].paymentMethod.status;

    return status === "created" || status === "adjustments" || status === "error";
  },

  canMakeAdjustments() {
    let template = Template.instance();
    let status = template.order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return false;
    }

    return true;
  },

  paymentApproved() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "approved";
  },

  paymentCaptured() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "completed";
  },

  refundTransactions() {
    let template = Template.instance();
    let transactions = template.order.billing[0].paymentMethod.transactions;

    return _.filter(transactions, (transaction) => {
      return transaction.type === "refund";
    });
  },

  refunds() {
    let refunds = Template.instance().refunds.get();

    if (_.isArray(refunds)) {
      return refunds.reverse();
    }

    return false;
  },

  /**
   * Get the total after all refunds
   * @return {Number} the amount after all refunds
   */
  adjustedTotal() {
    const template = Template.instance();
    const paymentMethod = template.order.billing[0].paymentMethod;
    const refunds = Template.instance().refunds.get();

    let lessAmount =  _.reduce(refunds, (memo, refund) => {
      return memo - Math.abs(refund.amount);
    }, paymentMethod.amount);

    return lessAmount;
  },

  refundSubmitDisabled() {
    const amount = Template.instance().refundAmount.get() || 0;
    if (amount === 0) {
      return "disabled";
    }
  },


  adjustedTotal2() {
    let template = Template.instance();
    let paymentMethod = template.order.billing[0].paymentMethod;
    // let transactions = paymentMethod.transactions;

    let refunds = Template.instance().refunds.get();
    template.test.set(_.reduce(refunds, (memo, refund) => {
      return memo - Math.abs(refund.amount);
    }, paymentMethod.amount));
    return template.test;
  },
  /**
   * Order
   * @summary find a single order using the order id spplied with the template
   * data context
   * @return {Object} A single order
   */
  order() {
    let template = Template.instance();
    return template.order;
  },


  showTrackingEdit() {
    let template = Template.instance();
    let currentData = Template.currentData();

    if (!currentData.tracking || template.showTrackingEditForm.get()) {
      return true;
    }
    return false;
  },

  shipment() {
    let template = Template.instance();
    let currentData = Template.currentData();
    let shipment = _.where(template.order.shipping, {_id: currentData.fulfillment._id})[0];

    return shipment;
  },

  items() {
    let template = Template.instance();
    let currentData = Template.currentData();
    let shipment = currentData.fulfillment;

    let items = _.map(shipment.items, (item) => {
      let originalItem = _.findWhere(template.order.items, {
        _id: item._id
      });
      return _.extend(originalItem, item);
    });

    return items;
  },

  shipmentItems(shipment) {
    let template = Template.instance();

    let items = _.map(shipment.items, (item) => {
      let originalItem = _.findWhere(template.order.items, {
        _id: item._id
      });
      return _.extend(originalItem, item);
    });

    return items;
  },

  /**
   * Media - find meda based on a variant
   * @param  {String|Object} variantObjectOrId A variant of a product or a variant Id
   * @return {Object|false}    An object contianing the media or false
   */
  media(variantObjectOrId) {
    let variantId = variantObjectOrId;

    if (typeof variant === "object") {
      variantId = variantObjectOrId._id;
    }

    let defaultImage = ReactionCore.Collections.Media.findOne({
      "metadata.variantId": variantId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }

    return false;
  }
});
