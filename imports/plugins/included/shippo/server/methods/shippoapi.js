/* eslint camelcase: 0 */
import Shippo from "shippo";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { purchaseAddressSchema, parcelSchema } from "../lib/shippoApiSchema";

export const ShippoApi = {
  methods: {}
};

// Checks if the Api key is valid one by trying to get the Shippo account's
// addresses list
ShippoApi.methods.confirmValidApiKey = new ValidatedMethod({
  name: "ShippoApi.methods.confirmValidApiKey",
  validate: new SimpleSchema({
    apiKey: {
      type: String
    }
  }).validator(),
  run({ apiKey }) {
    const shippoObj = new Shippo(apiKey);

    const getAddressListFiber = Meteor.wrapAsync(shippoObj.address.list, shippoObj.address);
    try {
      getAddressListFiber();
    } catch (error) {
      throw new Meteor.Error(error.message);
    }

    return true;
  }
});

// Returns a list of the activated/enabled Carriers (activated from the Shippo's
// account dashboard - not Reaction's)
ShippoApi.methods.getActiveCarriersList = new ValidatedMethod({
  name: "ShippoApi.methods.getActiveCarriersList",
  validate: new SimpleSchema({
    apiKey: {
      type: String
    }
  }).validator(),
  run({ apiKey }) {
    const shippoObj = new Shippo(apiKey);

    const getCarrierAccountsListFiber = Meteor.wrapAsync(shippoObj.carrieraccount.list, shippoObj.carrieraccount);
    try {
      const carrierAccounts = getCarrierAccountsListFiber();
      const activeCarriersList = [];
      if (carrierAccounts.count) {
        carrierAccounts.results.forEach(carrier => {
          if (carrier.active) {
            activeCarriersList.push({
              carrier: carrier.carrier, // this is a property of the returned result with value the name of the carrier
              carrierAccountId: carrier.object_id
            });
          }
        });
      }

      return activeCarriersList;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});

ShippoApi.methods.getCarriersRates = new ValidatedMethod({
  name: "ShippoApi.methods.getCarriersRates",
  validate: new SimpleSchema({
    shippoAddressFrom: { type: purchaseAddressSchema },
    shippoAddressTo: { type: purchaseAddressSchema },
    shippoParcel: { type: parcelSchema },
    purpose: { type: String, allowedValues: ["QUOTE", "PURCHASE"] },
    apiKey: { type: String },
    carrierAccounts: { type: [String], optional: true }
  }).validator(),
  run({ shippoAddressFrom, shippoAddressTo, shippoParcel, purpose, apiKey, carrierAccounts }) {
    const shippoObj = new Shippo(apiKey);

    const createShipmentFiber = Meteor.wrapAsync(shippoObj.shipment.create, shippoObj.shipment);
    try {
      const shipment = createShipmentFiber({
        object_purpose: purpose,
        address_from: shippoAddressFrom,
        address_to: shippoAddressTo,
        parcel: shippoParcel,
          // "carrier_accounts": carrierAccounts,  //Maybe some bug at the moment with shippo's api
        async: false                          // ..returns zero results if enabled
      });

      return shipment.rates_list;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});

// Makes the transaction for a chosen rate, and receives the printable label
ShippoApi.methods.purchaseShippingLabel = new ValidatedMethod({
  name: "ShippoApi.methods.purchaseShippingLabel",
  validate: new SimpleSchema({
    rateId: { type: String },
    apiKey: { type: String }
  }).validator(),
  run({ rateId, apiKey }) {
    const shippoObj = new Shippo(apiKey);

    const createTransactionFiber = Meteor.wrapAsync(shippoObj.transaction.create, shippoObj.transaction);
    try {
      const transaction = createTransactionFiber({
        rate: rateId,
        label_file_type: "PDF",
        async: false
      });

      return transaction;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});
