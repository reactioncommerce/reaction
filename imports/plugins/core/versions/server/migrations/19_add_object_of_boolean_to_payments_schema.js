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
        packages = Packages.findOne({ name: paymentMethodName[key] });
        Object.keys(PaypalSupport).forEach((paypal) => {
          support = packages.settings[PaypalSupport[paypal]].support;
          Packages.update({ name: paymentMethodName[key] }, {
            $set: {
              [`settings.${PaypalSupport[paypal]}.support`]: support
            }
          });
          // console.log(PaypalSupport[paypal], packages.settings[PaypalSupport[paypal]].support);
        });
      } else {
        packages = Packages.findOne({ name: paymentMethodName[key] });
        support = packages.settings[paymentMethodName[key]].support;
        Packages.update({ name: paymentMethodName[key] }, {
          $set: {
            [`settings.${paymentMethodName[key]}.support`]: support
          }
        });
        // console.log(paymentMethodName[key], support);
      }
    });
  },
  down() {
  }
});
