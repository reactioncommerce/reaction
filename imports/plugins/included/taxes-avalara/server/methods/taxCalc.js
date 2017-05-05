import _ from "lodash";
import accounting from "accounting-js";
import os from "os";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Packages, Shops, Accounts } from "/lib/collections";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import { Reaction, Logger } from "/server/api";
import Avalogger from "./avalogger";

const countriesWithRegions = ["US", "CA", "DE", "AU"];
const requiredFields = ["username", "password", "apiLoginId", "companyCode", "shippingTaxCode"];
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
 * @summary Verify that we have all required configuration data before attempting to use the API
 * @param {Object} packageData - Package data retrieved from the database
 * @returns {boolean} - isValid Is the current configuration valid
 */
function checkConfiguration(packageData = taxCalc.getPackageData()) {
  let isValid = true;
  const settings = _.get(packageData, "settings.avalara", {});
  for (const field of requiredFields) {
    if (!settings[field]) {
      const msg = `The Avalara package cannot function unless ${field} is configured`;
      Logger.warn(msg);
      Avalogger.error({ error: msg });
      isValid = false;
    }
  }
  if (!isValid) {
    throw new Meteor.Error("The Avalara package is not configured correctly. Cannot continue");
  }
  return isValid;
}

/**
 * @summary Get the auth info to authenticate to REST API
 * @param {Object} packageData - Optionally pass in packageData if we already have it
 * @returns {String} Username/Password string
 */
function getAuthData(packageData = taxCalc.getPackageData()) {
  if (checkConfiguration(packageData)) {
    const settings = _.get(packageData, "settings.avalara", {});
    const { username, password } = settings;
    const auth = `${username}:${password}`;
    return auth;
  }
}

/**
 * @summary Get exempt tax settings to pass to REST API
 * @param {String} userId id of user to find settings
 * @returns {Object} containing exemptCode and customerUsageType
 */
function getTaxSettings(userId) {
  return _.get(Accounts.findOne({ _id: userId }), "taxSettings");
}

/**
 * @summary function to get HTTP data and pass in extra Avalara-specific headers
 * @param {String} requestUrl - The URL to make the request to
 * @param {Object} options - An object of other options
 * @param {Boolean} testCredentials - determines skipping of configuration check
 * @returns {Object} Response from call
 */
function avaGet(requestUrl, options = {}, testCredentials = true) {
  const logObject = {};
  const pkgData = taxCalc.getPackageData();

  if (testCredentials) {
    if (!checkConfiguration(pkgData)) {
      return undefined;
    }
  }

  const appVersion = Reaction.getAppVersion();
  const meteorVersion = _.split(Meteor.release, "@")[1];
  const machineName = os.hostname();
  const avaClient = `Reaction; ${appVersion}; Meteor HTTP; ${meteorVersion}; ${machineName}`;
  const headers = {
    headers: {
      "X-Avalara-Client": avaClient,
      "X-Avalara-UID": "a0o33000004K8g3"
    }
  };
  const auth = options.auth || getAuthData();
  const timeout = { timeout: options.timeout || pkgData.settings.avalara.requestTimeout };
  const allOptions = Object.assign({}, options, headers, { auth }, timeout);
  if (pkgData.settings.avalara.enableLogging) {
    logObject.request = allOptions;
  }

  try {
    result = HTTP.get(requestUrl, allOptions);
  } catch (error) {
    result = error;
    Logger.error(`Encountered error while calling Avalara API endpoint ${requestUrl}`);
    Logger.error(error);
    logObject.error = error;
    Avalogger.error(logObject);
  }

  if (pkgData.settings.avalara.enableLogging) {
    logObject.duration = _.get(result, "headers.serverDuration");
    logObject.result = result.data;
    Avalogger.info(logObject);
  }

  return result;
}


/**
 * @summary to POST HTTP data and pass in extra Avalara-specific headers
 * @param {String} requestUrl - The URL to make the request to
 * @param {Object} options - An object of others options, usually data
 * @returns {Object} Response from call
 */
function avaPost(requestUrl, options) {
  const logObject = {};
  const pkgData = taxCalc.getPackageData();
  const appVersion = Reaction.getAppVersion();
  const meteorVersion = _.split(Meteor.release, "@")[1];
  const machineName = os.hostname();
  const avaClient = `Reaction; ${appVersion}; Meteor HTTP; ${meteorVersion}; ${machineName}`;
  const headers = {
    headers: {
      "X-Avalara-Client": avaClient,
      "X-Avalara-UID": "a0o33000004K8g3"
    }
  };
  const auth = { auth: getAuthData() };
  const timeout = { timeout: pkgData.settings.avalara.requestTimeout };
  const allOptions = Object.assign({}, options, headers, auth, timeout);
  if (pkgData.settings.avalara.enableLogging) {
    logObject.request = allOptions;
  }

  let result;

  try {
    result = HTTP.post(requestUrl, allOptions);
  } catch (error) {
    Logger.error(`Encountered error while calling API at ${requestUrl}`);
    Logger.error(error);
    logObject.error = error;
    // whether logging is enabled or not we log out errors
    Avalogger.error(logObject);
    result = {};
  }

  if (pkgData.settings.avalara.enableLogging) {
    logObject.duration = _.get(result, "headers.serverDuration");
    logObject.result = result.data;
    Avalogger.info(logObject);
  }

  return result;
}

/**
 * @summary Gets the full list of Avalara-supported entity use codes.
 * @returns {Object[]} API response
 */
taxCalc.getEntityCodes = function () {
  if (checkConfiguration()) {
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}definitions/entityusecodes`;
    const result = avaGet(requestUrl);

    if (result && result.code === "ETIMEDOUT") {
      throw new Meteor.Error("Request timed out while populating entity codes.");
    }

    return _.get(result, "data.value", []);
  }
  throw new Meteor.Error("bad-configuration", "Avalara package is enabled, but is not properly configured");
};

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
 * @summary Validate a particular address
 * @param {Object} address Address to validate
 * @returns {Object} The validated result
 */
taxCalc.validateAddress = function (address) {
  check(address, Object);

  const packageData = taxCalc.getPackageData();
  const { countryList } = packageData.settings.addressValidation;

  if (!_.includes(countryList, address.country)) {
    // if this is a country selected for validation, proceed
    // else use current address as response
    return { validatedAddress: address, errors: [] };
  }

  let messages;
  let validatedAddress = ""; // set default as falsy value
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
  const requestUrl = `${baseUrl}addresses/resolve`;
  const result = avaPost(requestUrl, { data: addressToValidate });
  let content;

  try {
    content = JSON.parse(result.content);
  } catch (error) {
    content = result.content;
  }
  if (content && content.messages) {
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
 * @summary Tests supplied Avalara credentials by calling company endpoint
 * @param {Object} credentials callback Callback function for asynchronous execution
 * @param {Boolean} testCredentials To be set as false so avaGet skips config check
 * @returns {Object} Object containing "statusCode" on success, empty response on error
 */
taxCalc.testCredentials = function (credentials, testCredentials = false) {
  check(credentials, Object);

  const baseUrl = getUrl();
  const auth = `${credentials.username}:${credentials.password}`;
  const requestUrl = `${baseUrl}companies/${credentials.companyCode}/transactions`;
  const result = avaGet(requestUrl, { auth, timeout: credentials.requestTimeout }, testCredentials);

  if (result && result.code === "ETIMEDOUT") {
    throw new Meteor.Error("Request Timed out. Increase your timeout settings");
  }

  if (result.statusCode === 200) {
    if (TaxCodes.find({}).count() === 0) {
      Meteor.call("avalara/getTaxCodes", (error, res) => {
        if (error) {
          if (typeof error === "object") {
            Meteor.call("logging/logError", "avalara",  error);
          } else {
            Meteor.call("logging/logError", "avalara",  { error });
          }
        } else if (res && Array.isArray(res)) {
          res.forEach(function (code) {
            Meteor.call("taxes/insertTaxCodes", Reaction.getShopId(), code, "taxes-avalara", (err) => {
              if (err) {
                throw new Meteor.Error("Error populating TaxCodes collection", err);
              }
            });
          });
        }
      });
    }
  }

  return { statusCode: result.statusCode };
};

/**
 * @summary get Avalara Tax Codes
 * @returns {Array} An array of Tax code objects
 */
taxCalc.getTaxCodes = function () {
  if (checkConfiguration()) {
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}definitions/taxcodes`;
    const result = avaGet(requestUrl);
    return _.get(result, "data.value", []);
  }
  throw new Meteor.Error("bad-configuration", "Avalara Tax package is enabled but not properly configured");
};

/**
 * @summary Translate RC cart into format for submission
 * @param {Object} cart RC cart to send for tax estimate
 * @returns {Object} SalesOrder in Avalara format
 */
function cartToSalesOrder(cart) {
  const pkgData = taxCalc.getPackageData();
  const { companyCode, shippingTaxCode } = pkgData.settings.avalara;
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const currencyCode = company.currency;
  const cartShipping = cart.cartShipping();
  const cartDate = moment(cart.createdAt).format();
  let lineItems = [];
  if (cart.items) {
    lineItems = cart.items.map((item) => {
      if (item.variants.taxable) {
        return {
          number: item._id,
          itemCode: item.productId,
          quantity: item.quantity,
          amount: item.variants.price * item.quantity,
          description: item.taxDescription || item.title,
          taxCode: item.variants.taxCode
        };
      }
    });
    if (cartShipping) {
      lineItems.push({
        number: "shipping",
        itemCode: "shipping",
        quantity: 1,
        amount: cartShipping,
        description: "Shipping",
        taxCode: shippingTaxCode
      });
    }
  }

  const salesOrder = {
    companyCode: companyCode,
    type: "SalesOrder",
    customerCode: cart.userId,
    date: cartDate,
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

  // current "coupon code" discount are based at the cart level, and every iten has it's
  // discounted property set to true.
  if (cart.discount)  {
    salesOrder.discount = accounting.toFixed(cart.discount, 2);
    for (const line of salesOrder.lines) {
      if (line.itemCode !== "shipping") {
        line.discounted = true;
      }
    }
  }
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
  check(callback, Function);

  if (cart.items && cart.shipping && cart.shipping[0].address) {
    const salesOrder = Object.assign({}, cartToSalesOrder(cart), getTaxSettings(cart.userId));
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}transactions/create`;
    const result = avaPost(requestUrl, { data: salesOrder });
    return callback(result.data);
  }
};

/**
 * @summary Translate RC order into format for final submission
 * @param {Object} order RC order to send for tax reporting
 * @returns {Object} SalesOrder in Avalara format
 */
function orderToSalesInvoice(order) {
  let documentType;
  const pkgData = taxCalc.getPackageData();
  const { companyCode, shippingTaxCode, commitDocuments } = pkgData.settings.avalara;
  if (commitDocuments) {
    documentType = "SalesInvoice";
  } else {
    documentType = "SalesOrder";
  }
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const currencyCode = company.currency;
  const orderShipping = order.orderShipping();
  const orderDate = moment(order.createdAt).format();
  const lineItems = order.items.map((item) => {
    if (item.variants.taxable) {
      return {
        number: item._id,
        itemCode: item.productId,
        quantity: item.quantity,
        amount: item.variants.price * item.quantity,
        description: item.taxDescription || item.title,
        taxCode: item.variants.taxCode
      };
    }
  });
  if (orderShipping) {
    lineItems.push({
      number: "shipping",
      itemCode: "shipping",
      quantity: 1,
      amount: orderShipping,
      description: "Shipping",
      taxCode: shippingTaxCode
    });
  }

  const salesInvoice = {
    companyCode: companyCode,
    type: documentType,
    commit: commitDocuments,
    code: order._id,
    customerCode: order.userId,
    date: orderDate,
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

  if (order.discount)  {
    salesInvoice.discount = accounting.toFixed(order.discount, 2);
    for (const line of salesInvoice.lines) {
      if (line.itemCode !== "shipping") {
        line.discounted = true;
      }
    }
  }
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
  // unlike the other functions, we expect this to always be called asynchronously
  if (order && order.shipping && order.shipping[0].address) {
    const salesOrder = Object.assign({}, orderToSalesInvoice(order), getTaxSettings(order.userId));
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}transactions/create`;
    try {
      const result = avaPost(requestUrl, { data: salesOrder });
      return callback(result.data);
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
  const pkgData = taxCalc.getPackageData();
  const { companyCode } = pkgData.settings.avalara;
  const company = Shops.findOne(Reaction.getShopId());
  const companyShipping = _.filter(company.addressBook, (o) => o.isShippingDefault)[0];
  const currencyCode = company.currency;
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}transactions/create`;
  const returnAmount = refundAmount * -1;
  const orderDate = moment(order.createdAt).format();
  const refundDate = moment().format();
  const refundReference = `${order.cartId}:${refundDate}`;
  const  lineItems = {
    number: "01",
    quantity: 1,
    amount: returnAmount,
    description: "refund"
  };
  const returnInvoice = {
    companyCode: companyCode,
    type: "ReturnInvoice",
    code: refundReference,
    commit: true,
    customerCode: order._id,
    taxDate: orderDate,
    date: refundDate,
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


  const result = avaPost(requestUrl, { data: returnInvoice });
  return callback(result.data);
};

export default taxCalc;

Meteor.methods({
  "avalara/addressValidation": taxCalc.validateAddress,
  "avalara/getTaxCodes": taxCalc.getTaxCodes,
  "avalara/testCredentials": taxCalc.testCredentials,
  "avalara/getEntityCodes": taxCalc.getEntityCodes
});
