Template.coreOrderShipments.onCreated(() => {
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
 * stateHelperTracking events
 */
Template.coreOrderShipments.events({
  "click [data-devent-action=shipmentsPacked]": function () {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow",
      "coreOrderShipments", this._id);
  },

  "click [data-event-action=addShipment]": (event, template) => {
    Meteor.call("orders/addShipment", template.data._id, {
      packed: false
    });
  },

  "click [data-event-action=removeShipment]": (event, template) => {
    let data = $(event.target).closest("[data-shipment-index]").data();
    Meteor.call("orders/removeShipment", template.data._id, data.shipmentIndex, (
      error) => {
      if (!error) {
        template.orderDep.changed();
      }
    });
  },

  "change select[name=shipmentSelect]": (event, template) => {
    let data = $(event.target).closest("[data-item]").data();
    let shipmentIndex = $(event.target).val();
    let order = template.order;
    let item = _.findWhere(order.items, {
      _id: data.itemId
    });
    let shipmentItem = {
      _id: item._id,
      productId: item.productId,
      shopId: item.shopId,
      variantId: item.variants._id,
      quantity: item.quantity
    };

    Meteor.call("orders/addItemToShipment", order._id, shipmentIndex,
      shipmentItem, (error) => {
        if (!error) {
          template.orderDep.changed();
        }
      });
  },

  "submit form[name=addTrackingForm]": (event, template) => {
    event.preventDefault();

    let orderId = template.data._id;
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
    return template.order;
  },

  itemsNotInShipments() {
    let template = Template.instance();
    let order = template.order;
    let shipments = order.shipping.shipments || [];
    let allItemsInShipments = [];

    for (let shipment of shipments) {
      allItemsInShipments = allItemsInShipments.concat(shipment.items);
    }

    let items = _.filter(order.items, (item) => {
      return _.where(allItemsInShipments, {
        _id: item._id
      }).length;
    });

    return items;
  },

  itemsInShipment(shipment) {
    let template = Template.instance();
    let order = template.order;

    return _.where(order.items, {
      shipment: shipment
    });
  },

  shipmentIndex(index) {
    return index + 1;
  },

  /**
   * Media - find meda based on a variant
   * @param  {String|Object} variantObjectOrId A variant of a product or a variant Id
   * @return {Object|false}    An object contianing the media or false
   */
  media(variantObjectOrId) {
    let variantId = variantObjectOrId;

    if (typeof variant === "Object") {
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
