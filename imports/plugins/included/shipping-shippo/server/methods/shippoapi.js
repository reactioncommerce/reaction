/* eslint camelcase: 0 */
import Shippo from "shippo";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Logger } from "/server/api";
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
    shippoObj.set("version", "2016-10-25");
    const getAddressListFiber = Meteor.wrapAsync(shippoObj.address.list, shippoObj.address);
    try {
      const addressList = getAddressListFiber();

      return addressList;
    } catch (error) {
      Logger.error(error.message);
      throw new Meteor.Error("server-error", error.message);
    }
  }
});


/**
 * Retrieves all Shippo carriers from the Shippo Account
 * @see https://goshippo.com/docs/reference#carrier-accounts-list
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} carrierAccountList - the compound object returned by Shippo
 * @return {Array} carrierAccountList.results - An array with the carrier accounts objects
 * @return {Number} carrierAccountList.count - the count of the carrier accounts objects.
 *
 */
ShippoApi.methods.getCarrierAccountsList = new ValidatedMethod({
  name: "ShippoApi.methods.getCarrierAccountsList",
  validate: new SimpleSchema({
    apiKey: {
      type: String
    }
  }).validator(),
  run({ apiKey }) {
    const shippoObj = new Shippo(apiKey);
    shippoObj.set("version", "2016-10-25");
    let allCarriers = [];

    // recursively fetch carriers because shippo returns paginated results
    function fetchCarriers() {
      try {
        const response = Meteor.wrapAsync(shippoObj.carrieraccount.list, shippoObj.carrieraccount)();
        allCarriers = allCarriers.concat(response.results);

        if (!response.next) {
          response.results = allCarriers;
          return response;
        }
        // the Shippo module uses "createFullPath" to form the url for the request
        // https://github.com/goshippo/shippo-node-client/blob/master/lib/Resource.js#L40-L48
        // hence we're passing the next url in this way
        shippoObj.carrieraccount.createFullPath = () => response.next;
        return fetchCarriers();
      } catch (error) {
        Logger.error(error.message);
        throw new Meteor.Error("server-error", error.message);
      }
    }

    return fetchCarriers();
  }
});

/**
 * Creates a Shippo's Shipment object for the given addresses and gets Rates for the particular shipment)
 * @see https://goshippo.com/docs/reference#shipments-create
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {Object} parameter.shippoAddressFrom - The address of the sender
 * @param {Object} parameter.shippoAddressTo - The address of the receiver
 * @param {Object} parameter.shippoParcel - The parcel dimensions's/weight
 * @param {String} parameter.purpose  - "QUOTE" or "PURCHASE" - The reason of the shipment(check prices/ purchase labels)
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} shipment - The compound shipment object returned by Shippo
 * @return {Array} shipment.rates_list - The available rate objects
 * */
ShippoApi.methods.createShipment = new ValidatedMethod({
  name: "ShippoApi.methods.createShipment",
  validate: new SimpleSchema({
    "shippoAddressFrom": purchaseAddressSchema,
    "shippoAddressTo": purchaseAddressSchema,
    "shippoParcel": parcelSchema,
    "purpose": { type: String, allowedValues: ["QUOTE", "PURCHASE"] },
    "apiKey": String,
    "carrierAccounts": { type: Array, optional: true },
    "carrierAccounts.$": String
  }).validator(),
  run({ shippoAddressFrom, shippoAddressTo, shippoParcel, purpose, apiKey, carrierAccounts }) {
    const shippoObj = new Shippo(apiKey);
    shippoObj.set("version", "2016-10-25");

    const createShipmentFiber = Meteor.wrapAsync(shippoObj.shipment.create, shippoObj.shipment);
    try {
      const shipment = createShipmentFiber({
        object_purpose: purpose,
        address_from: shippoAddressFrom,
        address_to: shippoAddressTo,
        parcel: shippoParcel,
        carrier_accounts: carrierAccounts,
        async: false
      });

      return shipment;
    } catch (error) {
      Logger.error(error.message);
      throw new Meteor.Error("server-error", error.message);
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
    shippoObj.set("version", "2016-10-25");

    const createTransactionFiber = Meteor.wrapAsync(shippoObj.transaction.create, shippoObj.transaction);
    try {
      const transaction = createTransactionFiber({
        rate: rateId,
        label_file_type: "PDF",
        async: false
      });

      if (transaction.object_status !== "SUCCESS") {
        const error = transaction.messages[0].text;
        Logger.error(error);
        throw new Meteor.Error("server-error", error);
      }

      return transaction;
    } catch (error) {
      Logger.debug(error.message);
      throw new Meteor.Error("server-error", error.message);
    }
  }
});

/**
 * Retrieves transaction with transactionId of Shippo Account
 * @see https://goshippo.com/docs/reference#transactions-retrieve
 * @param {Object} parameter - ValidatedMethod's parameter
 * @param {String} parameter.transactionId - unique identifier of the transaction object
 * @param {String} parameter.apiKey - The Test or Live Token required
 * for authentication by Shippo's api
 * @return {Object} transaction - transaction object returned by Shippo
 * */
ShippoApi.methods.getTransaction = new ValidatedMethod({
  name: "ShippoApi.methods.getTransaction",
  validate: new SimpleSchema({
    transactionId: { type: String },
    apiKey: { type: String }
  }).validator(),
  run({ transactionId, apiKey }) {
    const shippoObj = new Shippo(apiKey);
    shippoObj.set("version", "2016-10-25");

    const retrieveTransactionFiber = Meteor.wrapAsync(shippoObj.transaction.retrieve, shippoObj.transaction);
    try {
      const transaction = retrieveTransactionFiber(transactionId);
      return transaction;
    } catch (error) {
      Logger.error(error.message);
      throw new Meteor.Error("server-error", error.message);
    }
  }
});
