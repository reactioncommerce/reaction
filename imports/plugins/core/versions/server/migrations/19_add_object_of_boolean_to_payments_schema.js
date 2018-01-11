import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

const paymentMethodName = {
  Braintree: "reaction-braintree",
  AuthNet: "reaction-auth-net",
  Paypal: "reaction-paypal",
  Stripe: "reaction-stripe",
  Example: "example-paymentmethod"
};

const PaypalSupport = {
  Express: "express",
  Payflow: "payflow"
};

Migrations.add({
  version: 19,
  up() {
    // looping through paymentMethodName to get each paymentMethod
    Object.keys(paymentMethodName).forEach((key) => {
      let packages;
      let support;
      if (paymentMethodName[key] === "reaction-paypal") {
        packages = Packages.find({ name: paymentMethodName[key] });
        // Loop through all packages and update support to be an object
        packages.forEach((pkg) => {
          // Lopp through all paypalsupport of payment to get each paymentmethod
          Object.keys(PaypalSupport).forEach((paypal) => {
            support = pkg.settings[PaypalSupport[paypal]].support;
            // Checking to make sure support is an array
            if (Array.isArray(support)) {
              const supportObject = {};
              support.forEach((method) => {
                supportObject[method.toLowerCase().replace(/-/g, "_")] = true;
              });
              // Update the package  settings support document with the new support
              Packages.update({ _id: pkg._id }, {
                $set: {
                  [`settings.${PaypalSupport[paypal]}.support`]: supportObject
                }
              });
            }
          });
        });
      } else {
        packages = Packages.find({ name: paymentMethodName[key] });
        // Loop through all packages and update support to be an object
        packages.forEach((pkg) => {
          support = pkg.settings[paymentMethodName[key]].support;
          // Checking to make sure support is an array
          if (Array.isArray(support)) {
            const supportObject = {};
            // loop through support array
            support.forEach((method) => {
              supportObject[method.toLowerCase().replace(/-/g, "_")] = true;
            });
            // Update the package  settings support document with the new support
            Packages.update({ _id: pkg._id }, {
              $set: {
                [`settings.${paymentMethodName[key]}.support`]: supportObject
              }
            });
          }
        });
      }
    });
  },
  down() {
    // looping through paymentMethodName to get each paymentMethod
    Object.keys(paymentMethodName).forEach((key) => {
      let packages;
      let support;
      // reaction-paypal has paymentMethods of payflow and paypal
      // checking if paymentMethodName equals reaction-paypal
      if (paymentMethodName[key] === "reaction-paypal") {
        packages = Packages.find({ name: paymentMethodName[key] });
        // Loop through all packages and update support to be an array
        packages.forEach((pkg) => {
          Object.keys(PaypalSupport).forEach((paypal) => {
            support = pkg.settings[PaypalSupport[paypal]].support;
            // checking if support is an object
            if (typeof support === "object") {
              const supportArray = [];
              // loop through support object and push into supportArray;
              Object.keys(support).forEach((method) => {
                supportArray.push(method.charAt(0).toUpperCase() + method.slice(1));
              });
              // Update the package  settings support document with the new support
              Packages.update({ _id: pkg._id }, {
                $set: {
                  [`settings.${PaypalSupport[paypal]}.support`]: supportArray
                }
              });
            }
          });
        });
      } else {
        packages = Packages.find({ name: paymentMethodName[key] });
        // Loop through all packages and update support to be an array
        packages.forEach((pkg) => {
          support = pkg.settings[paymentMethodName[key]].support;
          if (typeof support === "object") {
            // intiliaze an empty array
            const supportArray = [];
            // loop through support object and push into supportArray;
            Object.keys(support).forEach((method) => {
              supportArray.push(method.charAt(0).toUpperCase() + method.slice(1));
            });
            // Update the package  settings support document with the new support
            Packages.update({ _id: pkg._id }, {
              $set: {
                [`settings.${paymentMethodName[key]}.support`]: supportArray
              }
            });
          }
        });
      }
    });
  }
});
