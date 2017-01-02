/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { purchaseAddressSchema, parcelSchema } from "../lib/shippoApiSchema";
import { Packages } from "/lib/collections";

export const ShippoApi = {};
ShippoApi.methods = {};

ShippoApi.methods.getApiKey = new ValidatedMethod({
  name: "ShippoApi.methods.getApiKey",
  validate: null,
  run() {
    const settings = Packages.findOne({ name: "reaction-shippo" }).settings;
    if (!settings.apiKey) {
      throw new Meteor.Error("403", "Invalid Shippo Credentials");
    }
    return settings.apiKey;
  }
});

// Checks if the Api key is valid one by trying to get the Shippo account's
// addresses list
ShippoApi.methods.confirmValidApiKey = new ValidatedMethod({
  name: "ShippoApi.methods.confirmValidApiKey",
  validate: new SimpleSchema({
    apiKey: { type: String } }).validator(),
  run({ apiKey }) {
    const Shippo = require("shippo")(apiKey);

    const getAddressListFiber = Meteor.wrapAsync(Shippo.address.list, Shippo.address);
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
    apiKey: { type: String, optional: true } }).validator(),
  run({ apiKey }) {
    let Shippo;
    if (!apiKey) {
      const dynamicApiKey = ShippoApi.methods.getApiKey.call();
      Shippo = require("shippo")(dynamicApiKey);
    } else {
      Shippo = require("shippo")(apiKey);
    }

    const getCarrierAccountsListFiber = Meteor.wrapAsync(Shippo.carrieraccount.list, Shippo.carrieraccount);
    try {
      const carrierAccounts = getCarrierAccountsListFiber();
      let activeCarriersList = [];
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
    apiKey: { type: String, optional: true },
    carrierAccounts: { type: [String], optional: true }
  }).validator(),
  run({ shippoAddressFrom, shippoAddressTo, shippoParcel, purpose, apiKey, carrierAccounts }) {
    let Shippo;
    if (!apiKey) {
      const dynamicApiKey = ShippoApi.methods.getApiKey.call();
      Shippo = require("shippo")(dynamicApiKey);
    } else {
      Shippo = require("shippo")(apiKey);
    }

    const createShipmentFiber = Meteor.wrapAsync(Shippo.shipment.create, Shippo.shipment);
    try {
      const shipment = createShipmentFiber({
            "object_purpose": purpose,
            "address_from": shippoAddressFrom,
            "address_to": shippoAddressTo,
            "parcel": shippoParcel,
            //"carrier_accounts": carrierAccounts,  //Maybe some bug at the moment with shippo's api
            "async": false                          //..returns zero results if enabled
      });
      return shipment.rates_list;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});
