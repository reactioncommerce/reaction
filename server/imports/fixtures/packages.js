import { Factory } from "meteor/dburles:factory";
import { Packages } from "/lib/collections";
import { getShopId } from "./shops";

export const getPkgData = (pkgName) => {
  const pkgData = Packages.findOne({
    name: pkgName
  });
  return pkgData;
};


export function examplePaymentMethod() {
  const examplePaymentMethodPackage = {
    name: "example-paymentmethod",
    icon: "fa fa-credit-card-alt",
    shopId: getShopId(),
    enabled: true,
    settings: {
      "mode": false,
      "apikey": "",
      "example": {
        enabled: false
      },
      "example-paymentmethod": {
        enabled: true,
        support: ["Authorize", "Capture", "Refund"]
      }
    },
    registry: [],
    layout: null
  };

  Factory.define("examplePaymentPackage", Packages, Object.assign({}, examplePaymentMethodPackage));
}

/**
 * @method examplePackage
 * @summary creates a new fixture based off of the Packages collection.
 * @since 1.5.5
 * @return {undefined} - returns nothing.
 */
export function examplePackage() {
  const examplePkg = {
    name: "example-package",
    settings: {
      enabled: false,
      apiUrl: "http://example.com/api"
    },
    shopId: "random-shop-101"
  };

  Factory.define("examplePackage", Packages, examplePkg);
}
