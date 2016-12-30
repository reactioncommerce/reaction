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
    let shippo;
    shippo = require("shippo")(apiKey);

    const getAddressListFiber = Meteor.wrapAsync(shippo.address.list, shippo.address);
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
    let shippo;
    if (!apiKey) {
      const dynamicApiKey = ShippoApi.methods.getApiKey.call();
      shippo = require("shippo")(dynamicApiKey);
    } else {
      shippo = require("shippo")(apiKey);
    }

    const getCarrierAccountsListFiber = Meteor.wrapAsync(shippo.carrieraccount.list, shippo.carrieraccount);
    try {
      const carrierAccounts = getCarrierAccountsListFiber();
      let activeCarriersList = [];
      if (carrierAccounts.count) {
        carrierAccounts.results.forEach(carrier => {
          if (carrier.active) {
            activeCarriersList.push({
              name: carrier.carrier, //this is a property of the returned result with value the name of the carrier
              carrierShippoId: carrier.object_id
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
    addressFrom: { type: purchaseAddressSchema },
    addressTo: { type: purchaseAddressSchema },
    parcel: { type: parcelSchema },
    purpose: { type: String, allowedValues: ["QUOTE", "PURCHASE"] },
    apiKey: { type: String, optional: true }
  }).validator(),
  run({ addressFrom, addressTo, parcel, purpose, apiKey }) {
    let shippo;
    if (!apiKey) {
      const dynamicApiKey = ShippoApi.methods.getApiKey.call();
      shippo = require("shippo")(dynamicApiKey);
    } else {
      shippo = require("shippo")(apiKey);
    }

    const createShipmentFiber = Meteor.wrapAsync(shippo.shipment.create, shippo.shipment);
    try {
      const shipment = createShipmentFiber({
            "object_purpose": purpose,
            "address_from": addressFrom,
            "address_to": addressTo,
            "parcel": parcel,
            "async": false
      });
      return shipment.rates_list;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});
