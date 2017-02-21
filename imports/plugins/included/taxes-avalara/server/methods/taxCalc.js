import _ from "lodash";
import os from "os";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { check, Match } from "meteor/check";
import { Packages, Shops } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

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
    "X-Avalara-UID": "a0o33000004K8g3"
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
    "X-Avalara-UID": "a0o33000004K8g3"
  };
  const auth = { auth: getAuthData() };
  const allOptions = Object.assign({}, options, headers, auth);
  const result = HTTP.post(requestUrl, allOptions);
  const smallerResult = result;
  delete smallerResult.content;
  Logger.info("duration", result.headers.serverduration);
  Logger.info("options", options);
  Logger.info("result", smallerResult);
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
 * @summary Tests supplied Avalara credentials by calling company endpoint
 * @param {Object} credentials callback Callback function for asynchronous execution
 * @returns {Object} Object containing "statusCode" on success, empty response on error
 */
taxCalc.testCredentials = function (credentials) {
  check(credentials, Object);

  const baseUrl = getUrl();
  const auth = `${credentials.username}:${credentials.password}`;
  const requestUrl = `${baseUrl}/companies/${credentials.companyCode}/transactions`;
  const result = avaGet(requestUrl, auth);
  return { statusCode: result.statusCode };
};

/**
 * @summary get Avalara Tax Codes
 * @returns {Array} An array of Tax code objects
 */
taxCalc.getTaxCodes = function () {
  const baseUrl = getUrl();
  const requestUrl = `${baseUrl}definitions/taxcodes`;
  const result = avaGet(requestUrl);
  return result.data.value;
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
  let lineItems = [];
  if (cart.items) {
    lineItems = cart.items.map((item) => {
      return {
        number: item._id,
        itemCode: item.productId,
        quantity: item.quantity,
        amount: item.variants.price * item.quantity,
        description: item.title,
        taxCode: item.variants.taxCode
      };
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
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}/transactions/create`;
    const result = avaPost(requestUrl, { data: salesOrder });
    if (callback) {
      return callback(result.data);
    }
    return result.data;
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
  const lineItems = order.items.map((item) => {
    return {
      number: item._id,
      itemCode: item.productId,
      quantity: item.quantity,
      amount: item.variants.price * item.quantity,
      description: item.title,
      taxCode: item.variants.taxCode
    };
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
  // unlike the other functions, we expect this to always be called asynchronously
  if (order && order.shipping && order.shipping[0].address) {
    const salesOrder = orderToSalesInvoice(order);
    const baseUrl = getUrl();
    const requestUrl = `${baseUrl}/transactions/create`;
    try {
      const result = avaPost(requestUrl, { data: salesOrder });
      const data = JSON.parse(result.content);
      return callback(data);
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
  "avalara/testCredentials": taxCalc.testCredentials
});
