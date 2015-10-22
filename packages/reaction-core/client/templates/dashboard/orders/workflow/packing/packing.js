Template.coreShipmentPacking.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;
  template.showTrackingEditForm = ReactiveVar(false);

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId);
  });
});


/**
 * stateHelperPacking events
 *
 */
Template.coreShipmentPacking.events({
  "click [data-event-action=shipmentsPacked]": () => {
    const currentData = Template.instance();

    Meteor.call("orders/shipmentPacking", currentData.order);
    // Meteor.call("workflow/pushOrderWorkflow", "coreOrderShipmentWorkflow", "coreShipmentPacking", this._id);
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();
    event.stopPropagation();

    const currentData = Template.currentData();
    const order = template.order;
    const shipment = currentData.fulfillment;
    const tracking = event.target.trackingNumber.value;

    Meteor.call("orders/updateShipmentTracking", order, shipment, tracking,
      (error) => {
        if (!error) {
          template.orderDep.changed();
          template.showTrackingEditForm.set(false);
        }
      });
  }
});


Template.coreShipmentPacking.helpers({
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
   * Order
   * @summary find a single order using the order id spplied with the template
   * data context
   * @return {Object} A single order
   */
  order() {
    let template = Template.instance();
    return template.order;
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
