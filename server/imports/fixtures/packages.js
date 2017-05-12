import { Factory } from "meteor/dburles:factory";
import { Packages } from "/lib/collections";
import { getShopId } from "./shops";

export const getPkgData = (pkgName) => {
  const pkgData = Packages.findOne({
    name: pkgName
  });
  return pkgData;
};


export default function () {
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

