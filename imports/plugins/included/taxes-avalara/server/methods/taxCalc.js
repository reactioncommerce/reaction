import _ from "lodash";
import os from "os";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check, Match } from "meteor/check";
import { Packages, Shops } from "/lib/collections";
import { Reaction } from "/server/api";

const countriesWithRegions = ["US", "CA", "DE", "AU"];
const taxCalc = {};

taxCalc.getPackageData = function () {
  const pkgData = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId(),
    enabled: true
  });
  return pkgData;
};

// Private methods

/**
 * @summary Get the root URL for REST calls
 * @returns {String} Base url
 */
function getUrl() {
  const packageData = taxCalc.getPackageData();
  const { productionMode } = packageData.settings.avalara;
  let baseUrl;
  if (!productionMode) {
    baseUrl = "https://sandbox-rest.avatax.com/api/v2/";
  } else {
    baseUrl = "https://rest.avatax.com";
  }
  return baseUrl;
}

/**
 * @summary Get the auth info to authenticate to REST API
 * @returns {String} Username/Password string
 */
function getAuthData() {
  const packageData = taxCalc.getPackageData();
  const { username, password } = _.get(packageData, "settings.avalara", {});

  if (!username || !password) {
    return new Meteor.Error("You cannot use this API without a username and password configured");
  }

  const auth = `${username}:${password}`;
  return auth;
}

/**
 * @summary function to get HTTP data and pass in extra Avalara-specific headers
 * @param {String} requestUrl - The URL to make the request to
 * @returns {Object} Response from call
 */
function avaGet(requestUrl) {
  const appVersion = Reaction.getAppVersion();
  const machineName = os.hostname();
  const avaClient = `Reaction; ${appVersion}; Meteor HTTP; 1.0; ${machineName}`;
  const headers = {
    "X-Avalara-Client": avaClient,
    "X-Avalara-UID": "xxxxxxx"
  };
  const auth = getAuthData();
  const result = HTTP.get(requestUrl, { headers, auth });
  return result;
}


/**
 * @summary to POST HTTP data and pass in extra Avalara-specific headers
 * @param {String} requestUrl - The URL to make the request to
 * @param {Object} options - An object of others options, usually data
 * @returns {Object} Response from call
 */
function avaPost(requestUrl, options) {
  const appVersion = Reaction.getAppVersion();
  const machineName = os.hostname();
  const avaClient = `Reaction; ${appVersion}; Meteor HTTP; 1.0; ${machineName}`;
  const headers = {
    "X-Avalara-Client": avaClient,
    "X-Avalara-UID": "xxxxxxx"
  };
  const auth = { auth: getAuthData() };
  const allOptions = Object.assign({}, options, headers, auth);
  const result = HTTP.post(requestUrl, allOptions);
  return result;
}

// API Methods

/**
 * @summary Calculate the taxable subtotal for a cart
 * @param {Cart} cart - Cart to calculate subtotal for
 * @returns {Number} Taxable subtotal
 */
taxCalc.calcTaxable = function (cart) {
  let subTotal = 0;
  for (const item of cart.items) {
    if (item.variants.taxable) {
      subTotal += (item.variants.price * item.quantity);
    }
  }
  return subTotal;
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
  }, { fields: { "settings.avalara.company.companyCode": 1 } });
  const companyCode = _.get(result, "settings.avalara.company.companyCode");
  if (companyCode) {
    return companyCode;
  }
  const savedCompany = taxCalc.saveCompany();
  return savedCompany.companyCode;
};

taxCalc.getCompany = function () {
  const result = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId(),
    enabled: true
  }, { fields: { "settings.avalara.company": 1 } });
  return result;
};

/**
 * @summary Validate a particular address
 * @param {Object} address Address to validate
 * @returns {Object} The validated result
 */
taxCalc.validateAddress = function (address) {
  check(address, Object);

  let messages;
  let validatedAddress;
  const errors = [];
  const addressToValidate  = {
    line1: address.address1,
    city: address.city,
    postalCode: address.postal,
    country: address.country
  };

  if (_.includes(countriesWithRegions, address.country)) {
    // if this is a country with regions, pass in region
    addressToValidate.region = address.region;
  }
  if (address.line2) {
    addressToValidate.line2 = address.address2;
  }
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}/addresses/resolve`;
  const result = avaPost(requestUrl, { data: addressToValidate });
  const content = JSON.parse(result.content);
  if (content.messages) {
    messages = content.messages;
  }
  if (messages) {
    for (const message of messages) {
      errors.push({ summary: message.summary, details: message.details });
    }
  }

  if (result && result.data && result.data.validatedAddresses.length !== 0) {
    const resultAddress = result.data.validatedAddresses[0];
    validatedAddress = {
      address1: resultAddress.line1,
      city: resultAddress.city,
      region: resultAddress.region,
      postal: resultAddress.postalCode,
      country: resultAddress.country
    };
    if (result.data.address.line2) {
      validatedAddress.addresss2 = resultAddress.line2;
    }
  }
  return { validatedAddress, errors };
};

/**
 * @summary Get all registered companies
 * @param {Function} callback Callback function for asynchronous execution
 * @returns {Object} API response object
 */
taxCalc.getCompanies = function (callback) {
  const auth = getAuthData();
  if (auth.error) {
    return _.assign({}, auth, { statusCode: 401 });
  }
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

/**
 * @summary Fetch the company object from the API and save in the DB
 * @returns {String} Company object
 */
taxCalc.saveCompany = function () {
  const companyData = taxCalc.getCompanies();
  const company = companyData.data.value[0];
  const packageData = taxCalc.getPackageData();
  Packages.update({ _id: packageData._id }, {
    $set: { "settings.avalara.company": company }
  });
  return company;
};

/**
 * @summary get Avalara Tax Codes
 * @returns {Array} An array of Tax code objects
 */
taxCalc.getTaxCodes = function () {
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}taxcodes`;
  const result = avaGet(requestUrl);
  return result.data.value;
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
  const currencyCode = company.currency;
  let lineItems = [];
  if (cart.items) {
    lineItems = cart.items.map((item, index) => {
      return {
        number: _.toString(index + 1),
        quantity: item.quantity,
        amount: item.variants.price * item.quantity,
        description: item.title,
        taxCode: item.variants.taxCode
      };
    });
  }

  const salesOrder = {
    companyCode: companyCode,
    type: "SalesOrder",
    code: cart._id,
    customerCode: cart.userId,
    date: moment.utc(cart.createdAt),
    currencyCode: currencyCode,
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
      }
    },
    lines: lineItems
  };
  return salesOrder;
}

/**
 * @summary Submit cart for tax calculation
 * @param {Cart} cart Cart object for estimation
 * @param {Function} callback callback when using async version
 * @returns {Object} result Result of SalesOrder call
 */
taxCalc.estimateCart = function (cart, callback) {
  check(cart, Reaction.Schemas.Cart);
  check(callback, Match.Optional(Function));

  if (cart.items && cart.shipping && cart.shipping[0].address) {
    const salesOrder = cartToSalesOrder(cart);
    const auth = getAuthData();
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}/transactions/create`;
    if (callback) {
      HTTP.post(requestUrl, { data: salesOrder, auth: auth }, (err, result) => {
        const data = JSON.parse(result.content);
        return callback(data);
      });
    }
    const result = avaPost(requestUrl, { data: salesOrder });
    return result.data;
  }
};

/**
 * @summary Translate RC order into format for final submission
 * @param {Object} order RC order to send for tax reporting
 * @returns {Object} SalesOrder in Avalara format
 */
function orderToSalesInvoice(order) {
  const companyCode = taxCalc.getCompanyCode();
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const currencyCode = company.currency;
  const lineItems = order.items.map((item, index) => {
    return {
      number: _.toString(index + 1),
      quantity: item.quantity,
      amount: item.variants.price * item.quantity,
      description: item.title,
      taxCode: item.variants.taxCode
    };
  });

  const salesInvoice = {
    companyCode: companyCode,
    type: "SalesInvoice",
    commit: true,
    code: order.cartId,
    customerCode: order.userId,
    date: moment.utc(order.createdAt),
    currencyCode: currencyCode,
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
        line1: order.shipping[0].address.address1,
        line2: order.shipping[0].address.address2 || "",
        city: order.shipping[0].address.city,
        region: order.shipping[0].address.region,
        country: order.shipping[0].address.country || "US"
      }
    },
    lines: lineItems
  };
  return salesInvoice;
}

/**
 * @summary Submit order for tax reporting
 * @param {Order} order Order object for submission
 * @param {Function} callback callback when using async version
 * @returns {Object} result Result of SalesInvoice call
 */
taxCalc.recordOrder = function (order, callback) {
  check(callback, Function);
  if (order && order.shipping && order.shipping[0].address) {
    const salesOrder = orderToSalesInvoice(order);
    const auth = getAuthData();
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}/transactions/create`;

    try {
      HTTP.post(requestUrl, { data: salesOrder, auth: auth }, (err, result) => {
        if (err) {
          Logger.error("Encountered error while recording order to Avalara");
          Logger.error(err);
        }
        const data = JSON.parse(result.content);
        return callback(data);
      });
    } catch (error) {
      Logger.error("Encountered error while recording order to Avalara");
      Logger.error(error);
    }
  }
};

/**
 * @summary Report refund to Avalara
 * @param {Order} order - The original order the refund was against
 * @param {Number} refundAmount - Amount to be refunded
 * @param {Function} callback - Callback
 * @returns {Object} Results from transaction call
 */
taxCalc.reportRefund = function (order, refundAmount, callback) {
  check(refundAmount, Number);
  check(callback, Function);
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const currencyCode = company.currency;
  const companyCode = taxCalc.getCompanyCode();
  const auth = getAuthData();
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}/transactions/create`;
  const returnAmount = refundAmount * -1;
  const  lineItems = {
    number: "01",
    quantity: 1,
    amount: returnAmount,
    description: "refund"
  };
  const returnInvoice = {
    companyCode: companyCode,
    type: "ReturnInvoice",
    code: order.cartId,
    commit: true,
    customerCode: order._id,
    taxDate: moment.utc(order.createdAt),
    date: moment(),
    currencyCode: currencyCode,
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
        line1: order.shipping[0].address.address1,
        line2: order.shipping[0].address.address2 || "",
        city: order.shipping[0].address.city,
        region: order.shipping[0].address.region,
        country: order.shipping[0].address.country || "US"
      }
    },
    lines: [lineItems]
  };

  if (callback) {
    HTTP.post(requestUrl, { data: returnInvoice, auth: auth }, (err, result) => {
      const data = JSON.parse(result.content);
      return callback(data);
    });
  }
  const result = HTTP.post(requestUrl, { data: returnInvoice, auth: auth });
  const data = JSON.parse(result.content);
  return data;
};

export default taxCalc;

Meteor.methods({
  "avalara/addressValidation": taxCalc.validateAddress,
  "avalara/getTaxCodes": taxCalc.getTaxCodes,
  "avalara/testConnection": taxCalc.getCompanies
});
