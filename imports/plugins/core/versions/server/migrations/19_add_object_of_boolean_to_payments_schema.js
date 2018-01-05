import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

const paymentMethodName = {
  Braintree: "reaction-braintree",
  AuthNet: "reaction-auth-net",
  Paypal: "reaction-paypal",
  Stripe: "reaction-stripe"
};

const PaypalSupport = {
  Express: "express",
  Payflow: "payflow"
};

Migrations.add({
  version: 19,
  up() {
    Object.keys(paymentMethodName).forEach((key) => {
      let packages;
      let support;
      if (paymentMethodName[key] === "reaction-paypal") {
        packages = Packages.find({ name: paymentMethodName[key] });
        packages.forEach((pkg) => {
          Object.keys(PaypalSupport).forEach((paypal) => {
            support = pkg.settings[PaypalSupport[paypal]].support;
            Packages.update({ _id: pkg._id }, {
              $set: {
                [`settings.${PaypalSupport[paypal]}.support`]: support
              }
            });
          });
        });
      } else {
        packages = Packages.find({ name: paymentMethodName[key] });
        packages.forEach((pkg) => {
          support = pkg.settings[paymentMethodName[key]].support;
          Packages.update({ _id: pkg._id }, {
            $set: {
              [`settings.${paymentMethodName[key]}.support`]: support
            }
          });
        });
      }
    });
  },
  down() {
  }
});
