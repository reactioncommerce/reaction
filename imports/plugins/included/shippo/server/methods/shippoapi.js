/* eslint camelcase: 0 */
import Shippo from "shippo";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { purchaseAddressSchema, parcelSchema } from "../lib/shippoApiSchema";

export const ShippoApi = {
  methods: {}
};


/**
 * Retrieves the address objects stored in Shippo Account
 * @see https://goshippo.com/docs/reference#addresses
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} addressList - compound object returned returned by Shippo
 * @return {Array} addressList.results - An array with the address objects
 * @return {Number} addressList.count - the count of the address objects.
 * */
ShippoApi.methods.getAddressList = new ValidatedMethod({
  name: "ShippoApi.methods.getAddressList",
  validate: new SimpleSchema({
    apiKey: {
      type: String
    }
  }).validator(),
  run({ apiKey }) {
    const shippoObj = new Shippo(apiKey);
    const getAddressListFiber = Meteor.wrapAsync(shippoObj.address.list, shippoObj.address);
    try {
      const addressList = getAddressListFiber();

      return addressList;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});


/**
 * Retrieves all the accounts of carriers of Shippo's Account
 * @see https://goshippo.com/docs/reference#carrier-accounts-list
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} carrierAccountList - the compound object returned by Shippo
 * @return {Array} carrierAccountList.results - An array with the carrier accounts objects
 * @return {Number} carrierAccountList.count - the count of the carrier accounts objects.
 * */
ShippoApi.methods.getCarrierAccountsList = new ValidatedMethod({
  name: "ShippoApi.methods.getCarrierAccountsList",
  validate: new SimpleSchema({
    apiKey: {
      type: String
    }
  }).validator(),
  run({ apiKey }) {
    const shippoObj = new Shippo(apiKey);

    const getCarrierAccountsListFiber = Meteor.wrapAsync(shippoObj.carrieraccount.list, shippoObj.carrieraccount);
    try {
      const carrierAccountList = getCarrierAccountsListFiber();
      return carrierAccountList;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});

/**
 * Creates a Shippo's Shipment object for the given addresses and gets Rates for the particular shipment)
 * @see https://goshippo.com/docs/reference#shipments-create
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {Object} parameter.shippoAddressFrom - The address of the sender.
 * @param {Object} parameter.shippoAddressTo - The address of the receiver.
 * @param {Object} parameter.shippoParcel - The parcel dimensions's/weight.
 * @param {String("QUOTE"|"PURCHASE")} parameter.purpose  - The reason of the shipment(check prices/ purchase labels)
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} shipment - The compound shipment object returned by Shippo
 * @return {Array} shipment.rates_list - The available rate objects.
 * */
ShippoApi.methods.createShipment = new ValidatedMethod({
  name: "ShippoApi.methods.createShipment",
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

      return shipment;
    } catch (error) {
      throw new Meteor.Error(error.message);
    }
  }
});

/**
 * Makes the transaction (purchasing of a shipping label from a shipping provider for a specific service)
 * for the specific rateId and returns its Shipping Label ,Tracking number etc
 * @see https://goshippo.com/docs/reference#transactions-create
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {String} parameter.rateId - unique identifier of the chosen rate object
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} transaction - The compound transaction object returned by Shippo
 * */
ShippoApi.methods.createTransaction = new ValidatedMethod({
  name: "ShippoApi.methods.createTransaction",
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
