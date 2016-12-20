/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { purchaseAddressSchema, parcelSchema } from "../lib/shippoApiSchema";

export const ShippoApi = {};
ShippoApi.methods = {};


// Checks if the Api key is valid one by trying to get the Shippo account's addresses list
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

ShippoApi.methods.getCarriersRates = new ValidatedMethod({
  name: "ShippoApi.methods.getCarriersRates",
  validate: new SimpleSchema({
    addressFrom: { type: purchaseAddressSchema },
    addressTo: { type: purchaseAddressSchema },
    parcel: { type: parcelSchema },
    purpose: { type: String, allowedValues: ["QUOTE", "PURCHASE"] }
  }).validator(),
  run({ addressFrom, addressTo, parcel, purpose }) {
    let shippo;
    shippo = require("shippo")(apiKey);

    try {
      shipment = shippo.shipment.create({
        "object_purpose": purpose,
        "address_from": addressFrom,
        "address_to": addressTo,
        "parcel": parcel,
        "submission_type": "DROPOFF",
        "async": false
      });
      console.log(JSON.stringify(shipment));
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
    // const getCarrierRatesFiber = Meteor.wrapAsync(shippo.ship, shippo.address);
    // try {
    //   getAddressListFiber();
    // } catch (error) {
    //   throw new Meteor.Error(error.message);
    // }
    // return true;

  }
});
