import { Factory } from "meteor/dburles:factory";
import { Packages } from "/lib/collections";
import { getShopId } from "./shops";

/**
 * @method getPkgData
 * @memberof Fixtures
 * @summary Get package data object, given a package name
 * @example getPkgData("example-paymentmethod") ? getPkgData("example-paymentmethod")._id : "uiwneiwknekwewe"
 * @param  {String} pkgName name of package
 * @return {Object}         Package object
 */
export const getPkgData = (pkgName) => {
  const pkgData = Packages.findOne({
    name: pkgName
  });
  return pkgData;
};

/**
 * @name examplePaymentMethod
 * @memberof Fixtures
 * @summary Create a new fixture based off an example payment package method
 * @example example = Factory.create("examplePaymentPackage");
 * @property {String} name - `"example-paymentmethod"`
 * @property {String} icon - `"fa fa-credit-card-alt"`
 * @property {String} shopId - `getShopId()`
 * @property {Boolean} enabled - `true`
 * @property {Object} settings - Object
 * @property {Boolean} settings.mode - `false`
 * @property {String} settings.apikey - `""`
 * @property {Object} example - Object
 * @property {Boolean} example.enabled - `false`
 * @property {Object} example-paymentmethod - Object
 * @property {Boolean} example-paymentmethod.enabled - `true`
 * @property {Array} example-paymentmethod.support - `["Authorize", "Capture", "Refund"]`
 * @property {Array} registry - `[]`
 * @property {Object} layout - `null`
 */
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
 * @name examplePackage
 * @memberof Fixtures
 * @summary Create a new fixture based off of the Packages collection.
 * @since 1.5.5
 * @property {String} name `"example-package"`
 * @property {Object} settings
 * @property {Boolean} settings.enabled `false`
 * @property {String} settings.apiUrl `http://example.com/api`
 * @property {String} shopId `"random-shop-id"`
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
