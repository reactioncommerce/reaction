import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

Migrations.add({
  version: 72,
  async up() {
    const { Cart, Shipping } = rawCollections;

    await Shipping.updateMany({
      "provider.name": "flatRates"
    }, {
      $set: {
        "methods.$[].fulfillmentTypes": ["shipping"]
      }
    });

    await Cart.updateMany({}, {
      $set: {
        "shipping.$[].shipmentMethod.fulfillmentTypes": ["shipping"],
        "shipping.$[groupWithShipmentQuotes].shipmentQuotes.$[].method.fulfillmentTypes": ["shipping"]
      }
    }, {
      arrayFilters: [{ "groupWithShipmentQuotes.shipmentQuotes": { $exists: true } }]
    });
  },
  async down() {
    const { Cart, Shipping } = rawCollections;

    await Shipping.updateMany({
      "provider.name": "flatRates"
    }, {
      $unset: {
        "methods.$[].fulfillmentTypes": ""
      }
    });

    await Cart.updateMany({}, {
      $unset: {
        "shipping.$[].shipmentMethod.fulfillmentTypes": "",
        "shipping.$[groupWithShipmentQuotes].shipmentQuotes.$[].method.fulfillmentTypes": ""
      }
    }, {
      arrayFilters: [{ "groupWithShipmentQuotes.shipmentQuotes": { $exists: true } }]
    });
  }
});
