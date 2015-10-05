

Template.coreOrderShipments.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;
  template.showTrackingEditForm = ReactiveVar(false);

  let getOrder = (orderId) => {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  };

  // console.log("Order on created", template.order);
  Tracker.autorun(() => {
    template.order = getOrder(currentData._id);
  });
});

/**
 * stateHelperTracking events
 */
Template.coreOrderShipments.events({
  "click #add-tracking-code": function (event, template) {
    var currentState, tracking;
    event.preventDefault();
    if (!this._id) {
      throw new Meteor.Error("Failed", "Missing tracking order.");
    }

    tracking = template.find("input[name=input-tracking-code]").value;
    if (!tracking) {
      Alerts.add("Tracking required to process order.", "danger", {
        autoHide: true
      });
      return false;
    }
    Meteor.call("orders/shipmentTracking", this, tracking);

    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
  },

  "click [data-event-action=addShipment]": (event, template) => {
    console.log(template.data);
    Meteor.call("orders/addShipment", template.data._id, {
      packed: false,
    });
  },

  "click [data-event-action=removeShipment]": (event, template) => {
    let data = $(event.target).closest("[data-shipment-index]").data();
    Meteor.call("orders/removeShipment", template.data._id, data.shipmentIndex, (error) => {
      if (!error) {
        template.orderDep.changed()
      }
    });
  },

  "change select[name=shipmentSelect]": (event, template) => {

    let data = $(event.target).closest("[data-item]").data();
    let shipmentIndex = parseInt($(event.target).val());
    console.log(data, shipmentIndex);
    // return;

    Meteor.call("orders/itemAddShipment", template.data._id, data.itemId, shipmentIndex, (error, result) => {
      if (!error) {
        template.orderDep.changed();
        console.log("completed", template.order);
      }
    });
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();

    let tracking = event.target.trackingNumber.value;
    let shipmentData = $(event.target).closest("[data-shipment]").data();
    console.log( tracking);
    let shipmentIndex = shipmentData.shipmentIndex;

    let data = {
      tracking: event.target.trackingNumber.value
    };

    Meteor.call("orders/updateShipmentTracking", template.data._id, shipmentIndex, tracking, (error, result) => {
      if (!error) {
        template.orderDep.changed();
        template.showTrackingEditForm.set(false);
      }
    });
  },

  "click [data-event-action=showTrackingEdit]": (event, template) => {
    template.showTrackingEditForm.set(true);

  }
});


Template.coreOrderShipments.helpers({

  showTrackingEdit(shipment) {
    let template = Template.instance();

    if (!shipment.tracking || template.showTrackingEditForm.get()) {
      return true;
    }

    return false;
  },

  order() {
    let template = Template.instance();
    return template.order;
  },

  itemsNotInShipments() {
    let template = Template.instance();
    let order = template.order;
    let shipments = order.shipments || [];

    let items = _.filter(order.items, (item) => {
      if (item.shipment > shipments.length - 1) {
        return true;
      }

      return false;
    });

    return items;
  },

  itemsInShipment(shipment) {
    let template = Template.instance();
    let order = template.order;

    return _.where(order.items, {shipment: shipment});
  },

  shipmentIndex(index) {
    return index + 1;
  },

  // parcels() {
  //   let template = Template.instance();
  //   return template.order.shipments;
  // },

  /**
   * Media - find meda based on a variant
   * @param  {Product} variant A variant of a product
   * @return {Object|false}    An object contianing the media or false
   */
  media(variant) {
    let defaultImage = ReactionCore.Collections.Media.findOne({
      "metadata.variantId": variant.parentId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }

    return false;
  }
});
