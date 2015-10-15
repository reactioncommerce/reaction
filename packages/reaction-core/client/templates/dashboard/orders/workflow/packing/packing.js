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
    template.order = getOrder(currentData._id);
  });
});


/**
 * stateHelperPacking events
 *
 */
Template.coreShipmentPacking.events({
  "click .btn": function () {
    Meteor.call("orders/shipmentPacking", this);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreShipmentPacking", this._id);
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();

    console.log("thigs", template.data);
return
    let orderId = template.order._id;
    let tracking = event.target.trackingNumber.value;
    let shipmentData = $(event.target).closest("[data-shipment]").data();
    let shipmentId = shipmentData.shipmentId;

    Meteor.call("orders/updateShipmentTracking", orderId, shipmentId,
      tracking, (error) => {
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


  items() {
    let currentData = Template.currentData();

    let items = _.map(currentData.items, (item) => {
      let originalItem = _.findWhere(currentData.items, {
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

  order() {
    let template = Template.instance();
    console.log(template.order);
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
