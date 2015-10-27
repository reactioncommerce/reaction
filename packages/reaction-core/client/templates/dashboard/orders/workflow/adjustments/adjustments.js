Template.coreOrderAdjustments.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId);
  });
});

/**
 * coreOrderAdjustments events
 */
Template.coreOrderAdjustments.events({

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();

    let order = template.order;
    let discount = parseFloat(event.target.discount_amount.value) || 0;
    Meteor.call("orders/approvePayment", order, discount, (error) => {
      if (error) {
        // Show error
      }
    });
  }
});


/**
 * coreOrderAdjustments helpers
 */
Template.coreOrderAdjustments.helpers({

  /**
   * Discount
   * @return {Number} current discount amount
   */
  invoice() {
    event.preventDefault();

    let template = Template.instance();
    let order = template.order;

    return order.billing[0].invoice;
  },

  money(amount) {
    return ReactionCore.Currency.formatNumber(amount);
  },

  currencySymbol() {
    return "$"
    // return ReactionCore.Locale.currency.symbol
  },

  disabled() {
    let template = Template.instance();
    let status = template.order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return "disabled";
    }

    return false;
  },

  paymentPendingApproval() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "created";
  },

  invloceLocked() {
    let template = Template.instance();
    let status = template.order.billing[0].paymentMethod.status;

    if (status === "approved" || status === "completed") {
      return true;
    }

    return false;
  },

  paymentApproved() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "approved";
  },

  paymentCaptured() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "completed";
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
