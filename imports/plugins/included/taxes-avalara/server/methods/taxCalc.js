import os from "os";
import _ from "lodash";
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Shops, Accounts } from "/lib/collections";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import { Reaction, Logger } from "/server/api";
import Avalogger from "./avalogger";

let moment;
async function lazyLoadMoment() {
  if (moment) return;
  moment = await import("moment");
}

const countriesWithRegions = ["US", "CA", "DE", "AU"];
const requiredFields = ["username", "password", "apiLoginId", "companyCode", "shippingTaxCode"];
const taxCalc = {};

taxCalc.getPackageData = function () {
  const pkgData = Reaction.getPackageSettings("taxes-avalara");
  return pkgData;
};

// Private methods

/**
 * @summary Get the root URL for REST calls
 * @returns {String} Base url
 */
function getUrl() {
  const packageData = taxCalc.getPackageData();
  const { mode } = packageData.settings.avalara;
  let baseUrl;
  if (mode) {
    baseUrl = "https://rest.avatax.com/api/v2/";
  } else {
    baseUrl = "https://sandbox-rest.avatax.com/api/v2/";
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
    Logger.error("The Avalara package is not configured correctly. Cannot continue");
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
 * @summary: Break Avalara error object into consistent format
 * @param {Object} error The error result from Avalara
 * @returns {Object} Error object with code and errorDetails
 */
function parseError(error) {
  let errorData;
  // The Avalara API constantly times out, so handle this special case first
  if (error.code === "ETIMEDOUT") {
    errorData = {
      errorCode: 503,
      type: "apiFailure",
      errorDetails: {
        message: "ETIMEDOUT",
        description: "The request timed out"
      }
    };
    return errorData;
  }

  if (error.response && error.response.statusCode === 401) {
    // authentification error
    errorData = {
      errorCode: 401,
      type: "apiFailure",
      errorDetails: {
        message: error.message,
        description: error.description
      }
    };
    return errorData;
  }

  if (error.response && error.response.data && error.response.data.error.details) {
    const errorDetails = [];
    const { details } = error.response.data.error;
    for (const detail of details) {
      if (detail.severity === "Error") {
        errorDetails.push({ message: detail.message, description: detail.description });
      }
    }
    errorData = { errorCode: details[0].number, errorDetails };
  } else {
    Avalogger.error("Unknown error or error format");
  }
  return errorData;
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

  let result;
  try {
    result = HTTP.get(requestUrl, allOptions);
  } catch (error) {
    Logger.error(`Encountered error while calling Avalara API endpoint ${requestUrl}`);
    Logger.error(error);
    logObject.error = error;
    Avalogger.error(logObject);
    const parsedError = parseError(error);
    result = { error: parsedError };
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
  // If package is not configured don't bother making an API call
  if (!checkConfiguration(pkgData)) {
    return {
      error: {
        errorCode: 400,
        type: "apiFailure",
        errorDetails: {
          message: "API is not configured"
        }
      }
    };
  }
  const appVersion = Reaction.getAppVersion();
  const meteorVersion = Meteor.release.split("@")[1];
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
    const parsedError = parseError(error);
    result = { error: parsedError };
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
      throw new Meteor.Error("request-timeout", "Request timed out while populating entity codes.");
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
  const addressToValidate = {
    line1: address.address1,
    city: address.city,
    postalCode: address.postal,
    country: address.country
  };

  if (_.includes(countriesWithRegions, address.country)) {
    // if this is a country with regions, pass in region
    addressToValidate.region = address.region;
  }
  if (address.address2) {
    addressToValidate.line2 = address.address2;
  }
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}addresses/resolve`;
  const result = avaPost(requestUrl, { data: addressToValidate });
  if (result.error) {
    if (result.error.type === "apiError") {
      // If we have a problem with the API there's no reason to tell the customer
      // so let's consider this unvalidated but move along
      Logger.error("API error, ignoring address validation");
    }

    if (result.error.type === "validationError") {
      // We received a validation error so we need somehow pass this up to the client
      Logger.error("Address Validation Error");
    }
  }
  const content = result.data;
  if (content && content.messages) {
    ({ messages } = content);
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
    if (resultAddress.line2) {
      validatedAddress.address2 = resultAddress.line2;
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
    throw new Meteor.Error("request-timeout", "Request Timed out. Increase your timeout settings");
  }

  if (result.statusCode === 200) {
    if (TaxCodes.find({}).count() === 0) {
      Meteor.call("avalara/getTaxCodes", (error, res) => {
        if (error) {
          if (typeof error === "object") {
            Meteor.call("logging/logError", "avalara", error);
          } else {
            Meteor.call("logging/logError", "avalara", { error });
          }
        } else if (res && Array.isArray(res)) {
          res.forEach((code) => {
            Meteor.call("taxes/insertTaxCodes", Reaction.getShopId(), code, "taxes-avalara", (err) => {
              if (err) {
                throw new Meteor.Error("error-occurred", "Error populating TaxCodes collection", err);
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
  const cartShipping = cart.getShippingTotal();
  Promise.await(lazyLoadMoment());
  const cartDate = moment(cart.createdAt).format();
  let lineItems = [];
  if (cart.items) {
    lineItems = cart.items.reduce((items, item) => {
      if (item.variants.taxable) {
        const itemObj = {
          number: item._id,
          itemCode: item.productId,
          quantity: item.quantity,
          amount: item.variants.price * item.quantity,
          description: item.taxDescription || item.title,
          taxCode: item.variants.taxCode
        };
        items.push(itemObj);
      }
      return items;
    }, []);
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
    companyCode,
    type: "SalesOrder",
    customerCode: cart.userId,
    date: cartDate,
    currencyCode,
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
  if (cart.discount) {
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
  Reaction.Schemas.Cart.validate(cart);
  check(callback, Function);

  if (cart.items && cart.shipping && cart.shipping[0].address) {
    const salesOrder = Object.assign({}, cartToSalesOrder(cart), getTaxSettings(cart.userId));
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}transactions/create`;
    const result = avaPost(requestUrl, { data: salesOrder });
    if (!result.error) {
      return callback(result.data);
    }
    return callback(result);
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
  const orderShipping = order.getShippingTotal();
  Promise.await(lazyLoadMoment());
  const orderDate = moment(order.createdAt).format();
  const lineItems = order.items.reduce((items, item) => {
    if (item.variants.taxable) {
      const itemObj = {
        number: item._id,
        itemCode: item.productId,
        quantity: item.quantity,
        amount: item.variants.price * item.quantity,
        description: item.taxDescription || item.title,
        taxCode: item.variants.taxCode
      };
      items.push(itemObj);
    }
    return items;
  }, []);

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
    companyCode,
    type: documentType,
    commit: commitDocuments,
    code: order._id,
    customerCode: order.userId,
    date: orderDate,
    currencyCode,
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

  if (order.discount) {
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
  Promise.await(lazyLoadMoment());
  const orderDate = moment(order.createdAt);
  const refundDate = moment();
  const refundReference = `${order.cartId}:${refundDate}`;
  const lineItems = {
    number: "01",
    quantity: 1,
    amount: returnAmount,
    description: "refund"
  };
  const returnInvoice = {
    companyCode,
    type: "ReturnInvoice",
    code: refundReference,
    commit: true,
    customerCode: order._id,
    date: refundDate,
    currencyCode,
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

  if (orderDate.diff(refundDate, "days") !== 0) {
    returnInvoice.taxOverride = {
      type: "TaxDate",
      taxDate: orderDate.format(),
      reason: "Refunded after order placed"
    };
  }

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
