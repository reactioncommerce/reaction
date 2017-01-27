import USPS from "usps-webtools";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

zipcode = {};

function getPackageData() {
  const pkgData = Packages.findOne({
    name: "reaction-geocode",
    shopId: Reaction.getShopId(),
    enabled: true
  });
  return pkgData;
}

zipcode.cityStateLookup = function (zipcode) {
  const pkgData = getPackageData();
  if (pkgData && pkgData.settings.uspsUserId) {
    const usps = new USPS({
      server: "http://production.shippingapis.com/ShippingAPI.dll",
      ttl: 10000,
      userId: pkgData.settings.uspsUserId });
    const wrappedFunction = Meteor.wrapAsync(usps.cityStateLookup, usps);
    const options = { zip: zipcode };
    const results = wrappedFunction(options);
    return results;
  }
  return undefined;
};

export default zipcode;
