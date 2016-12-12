import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const ShippoApi = {};
ShippoApi.methods = {};


// Checks if the Api key is valid one by trying to get the Shippo account's addresses list
ShippoApi.methods.confirmValidApiKey = new ValidatedMethod({
  name: "ShippoApi.methods.checkApiKey",
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

