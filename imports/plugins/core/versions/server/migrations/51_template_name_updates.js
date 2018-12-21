import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

/**
 * Note that we use rawCollection because Meteor collections do not forward the arrayFilters option yet.
 */

Migrations.add({
  version: 51,
  up() {
    // coreOrderShippingSummary -> OrderSummary
    Packages.rawCollection().update({
      "layout.template": "coreOrderShippingSummary"
    }, {
      $set: {
        "layout.$[elem].template": "OrderSummary"
      }
    }, {
      arrayFilters: [{ "elem.template": "coreOrderShippingSummary" }],
      multi: true
    });

    // coreOrderShippingInvoice -> OrderInvoice
    Packages.rawCollection().update({
      "layout.template": "coreOrderShippingInvoice"
    }, {
      $set: {
        "layout.$[elem].template": "OrderInvoice"
      }
    }, {
      arrayFilters: [{ "elem.template": "coreOrderShippingInvoice" }],
      multi: true
    });
  },
  down() {
    Packages.rawCollection().update({
      "layout.template": "OrderSummary"
    }, {
      $set: {
        "layout.$[elem].template": "coreOrderShippingSummary"
      }
    }, {
      arrayFilters: [{ "elem.template": "OrderSummary" }],
      multi: true
    });

    Packages.rawCollection().update({
      "layout.template": "OrderInvoice"
    }, {
      $set: {
        "layout.$[elem].template": "coreOrderShippingInvoice"
      }
    }, {
      arrayFilters: [{ "elem.template": "OrderInvoice" }],
      multi: true
    });
  }
});
