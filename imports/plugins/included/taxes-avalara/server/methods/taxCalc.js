import _ from "lodash";
import moment from "moment";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Packages, Shops } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

function getPackageData() {
  const pkgData = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId(),
    enabled: true
  });
  return pkgData;
}

function getUrl() {
  const packageData = getPackageData();
  const { productionMode } = packageData.settings.avalara;
  let baseUrl;
  if (!productionMode) {
    baseUrl = "https://sandbox-rest.avatax.com/api/v2/";
  }
  else { baseUrl = "nope nope nope"; }
  return baseUrl;
}

const taxCalc = {};


function getAuthData() {
  const packageData = getPackageData();
  const { username, password } = packageData.settings.avalara;

  if (!username || !password) {
    throw new Meteor.Error("You cannot use this API without a username and password configured");
  }

  const auth = `${username}:${password}`;
  return auth;
}

/**
 * @summary Set debug bit
 * @param {Boolean} isDebug whether to turn debug on or not
 * @returns {Boolean} this.debug
 */
taxCalc.setDebug = function(isDebug = true) {
  this.debug = isDebug;
  Logger.info(`debug is ${this.debug}`);
  return this.debug;
};

/**
 * @summary Get the company code from the db
 * @returns {String} Company Code
 */
taxCalc.getCompanyCode = function () {
  const result = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId(),
    enabled: true
  }, { fields: { "settings.avalara.companyCode": 1 } });
  return result.settings.avalara.companyCode;
};

/**
 * @summary Validate a particular address
 * @param {Object} address Address to validate
 * @param {Function} callback Optional callback function
 */
taxCalc.validateAddress = function (address, callback) {
  check(address, Object);
  const auth = getAuthData();
  const requestUrl = "https://sandbox-rest.avatax.com/api/v2/addresses/resolve";
  // provide a synchronous version for testing
  if (callback) {
    HTTP.post(requestUrl, { data: address, auth: auth }, (err, result) => {
      return (callback(result));
    });
  } else {
    const result = HTTP.post(requestUrl, { data: address, auth: auth });
    return result;
  }
};

taxCalc.getCompanies = function (callback) {
  const auth = getAuthData();
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}/companies`;

  if (callback) {
    HTTP.get(requestUrl, { auth: auth }, (err, result) => {
      return (callback(result));
    });
  } else {
    const result = HTTP.get(requestUrl, { auth: auth });
    return result;
  }
};

taxCalc.saveCompanyCode = function () {
  const companyData = taxCalc.getCompanies();
  const companyCode = companyData.data.value[0].companyCode;
  const packageData = getPackageData();
  Packages.update({ _id: packageData._id }, {
    $set: { "settings.avalara.companyCode": companyCode }
  });
  return companyCode;
};

taxCalc.recordOrder = function (order) {

};





/**
 * @summary Translate RC cart into format for submission
 * @param {Object} cart RC cart to send for tax estimate
 * @returns {Object} SalesOrder in Avalara format
 */
function cartToSalesOrder(cart) {
  const companyCode = taxCalc.getCompanyCode();
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const lineItems = cart.items.map((item, index) => {
    return {
      number: index.toString() + 1,
      quantity: item.quantity,
      amount: item.variants.price * item.quantity,
      description: item.title
    };
  });

  console.log("lineItems", lineItems);
  const salesOrder = {
    companyCode: companyCode,
    type: "SalesOrder",
    code: cart._id,
    date: moment.utc(cart.createdAt),
    addresses: {
      ShipFrom: {
        line1: companyShipping.address1,
        line2: companyShipping.address2,
        city: companyShipping.city,
        region: companyShipping.region,
        country: companyShipping.country,
        postalCode: companyShipping.postal
      },
      ShipTo: {
        line1: cart.shipping[0].address.address1,
        line2: cart.shipping[0].address.address2 || "",
        city: cart.shipping[0].address.city,
        region: cart.shipping[0].address.region,
        country: cart.shipping[0].address.country || "US"
      },
      lines: lineItems
    }
  };
  return salesOrder;
}

taxCalc.estimateCart = function (cart, callback) {
  // check(cart, Object);

  const salesOrder = cartToSalesOrder(cart);
  const auth = getAuthData();
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}/transactions/create`;
  const result = HTTP.post(requestUrl, { data: salesOrder, auth: auth });
  return result;

};


export default taxCalc;
