import https from "https";
import { check } from "meteor/check";
import { Logger } from "/server/api";
import countries from "./countries";


const errors = {
  BAD_COUNTRY: "Invalid country code. Please check the list of available country codes",
  CALLBACK_NOT_FUNCTION: "Failed because the callback was not a function.",
  STREET_ERROR: "The street address was either not a string or was too short (< 5 chars)",
  STATE_ERROR: "The state was either not a string or was too short (< 2 chars)",
  ZIP_ERROR: "The postal code must be between 5-10 chars"
};

// begin the operational code

const taxrates = {};


/**
 * @method taxrates.taxByPostal
 * @summary return taxrates for a specific postal code
 * @param {String} APIKey : your TaxRates.com API Key
 * @param {String} country : Country code in ISO 3166-1 alpha-3 format (e.g. "USA")
 * @param {String} postal : zip code of the address
 * @param {String} callback : callback function to pass response to.
 * @returns {Object} An object of rate information
 */
taxrates.taxByPostal = function (APIKey, country, postal, callback) {
  check(APIKey, String);
  check(country, String);
  check(postal, String);
  check(callback, Function);

  const isCountryCodeValid = isCountryValid(country);
  if (!isCountryCodeValid) {
    errorDeath(errors.BAD_COUNTRY, arguments);
  }
  if ((postal.length > 10) || (postal.length < 5)) {
    errorDeath(errors.ZIP_ERROR, arguments);
  }

  let requri = `https://taxrates.api.avalara.com/postal?country=${country}`;
  requri += "&postal=" + encodeURIComponent(postal);
  requri += "&apikey=" + encodeURIComponent(APIKey);

  https.get(requri, function (res) {
    processResponse(res, callback);
  });
};


/**
 * @method taxrates.taxByAddress
 *
 * @param {String} APIKey : REQUIRED : your TaxRates.com API Key
 * @param {String} street : REQUIRED : first line of the address, e.g. "1101 Alaskan Way"
 * @param {String} city : OPTIONAL : City of the address
 * @param {String} state : REQUIRED : State or region (e.g "WA" or "Washington")
 * @param {String} country : REQUIRED : Country code in ISO 3166-1 alpha-3 format (e.g. "USA")
 * @param {String} postal : OPTIONAL : zip code of the address
 * @param {Function} callback : REQUIRED : callback function to pass response to.
 */

taxrates.taxByAddress = function (APIKey, street, city, state, country, postal, callback) {
  check(APIKey, String);
  check(street, String);
  check(city, String);
  check(state, String);
  check(country, String);
  check(postal, String);
  check(callback, Function);

  let requri = `https://taxrates.api.avalara.com/address?country=${country}`;
  requri += "&state=" + encodeURIComponent(state);
  if (typeof city !== "undefined") requri += "&city=" + encodeURIComponent(city);
  if (typeof postal !== "undefined") requri += "&postal=" + encodeURIComponent(postal);
  requri += "&street=" + encodeURIComponent(street);
  requri += "&apikey=" + encodeURIComponent(APIKey);

  https.get(requri, function (res) {
    processResponse(res, callback);
  });
};

/**
 * @method processResponse
 * @summary Processes responses that come back with a 200 code
 * @param {Object} response : result that comes back from the https get
 * @param {Function} callback : callback function from calling code
 * @return {Object} a JavaScript object containing the totalRate and array of the individual rates that contribute to that total.
 *
 */

function processResponse(response, callback) {
  if (response.statusCode !== 200) {
    return (processError(response, callback));
  }

  response.on("data", function (d) {
    let data = d.toString();
    data = JSON.parse(data);
    data.error = false;
    return (callback(data));
  });
}


/**
 * @method processError
 * @param {Object} res : result that comes back from the https get
 * @param {Function} callback : callback function from calling code
 * @return {Object} data : contains data about the error
 *
 * Processes any response that doesn't come back with a 200 status code
 *
 */
function processError(res, callback) {
  const messages = {
    400: "Unable to resolve request. Likely one or more pieces of data (street address, city, state, country, or API Key) was invalid.",
    401: "Authorization Failed: No API Key was provided or you provided more than one form of ID for authentication",
    429: "Rate limit exceeded, i.e. you are sending too many requests too fast. Please slow down and/or try again later."
  };

  if (typeof messages[res.statusCode] === undefined) {
    messages[res.statuscode] = "Unknown Error. Please contact Avalara with error code: " + res.statuscode;
  }

  const data = {
    error: true,
    code: res.statusCode,
    message: messages[res.statusCode]
  };

  return (callback(data));
}

/**
 * @method isCountryValid(code)
 *
 * Contains a list of country identifiers accurate as of August 2015 and checks
 * the incoming code for validity
 *
 * @param {String} country
 * @return {Boolean} : is code submitted one of the identifiers
 */

function isCountryValid(country) {
  const uccode = country.toUpperCase();
  return countries(indexOf(uccode) !== -1);
}

/**
 * Display error message and throw error
 * @param e
 * @param argarray
 */
function errorDeath(e, argarray) {
  Logger.error("\n\n***********************************************");
  Logger.error("DEBUG INFO: Arguments\n");
  Logger.error(argarray);
  Logger.error("***********************************************\n\n");
  throw new Error(e);
}

export default taxrates;
