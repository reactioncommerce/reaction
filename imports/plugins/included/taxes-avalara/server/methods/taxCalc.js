import { HTTP } from "meteor/http";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

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
  else {
    baseUrl = "nope nope nope";
  }
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


export default taxCalc;
