import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

const paymentMethodName = {
  Braintree: "reaction-braintree",
  AuthNet: "reaction-auth-net",
  PaypalExpress: "reaction-paypal",
  PayflowPro: "reaction-paypal",
  Stripe: "reaction-stripe"
};

Migrations.add({
  version: 19,
  up() {
    if (paymentMethodName) {
      Object.keys(paymentMethodName).forEach((key) => {
        Packages.update({ name: paymentMethodName[key] }, {
          $set: {
            [`settings.${paymentMethodName[key]}.support`]: {
              type: Object,
              label: "Payment provider supported methods"
            },
            [`settings.${paymentMethodName[key]}.support`]: {
              label: "Authorize",
              defaultValue: true
            },
            [`settings.${paymentMethodName[key]}.support`]: {
              label: "De-Authorize",
              defaultValue: false
            },
            [`settings.${paymentMethodName[key]}.support`]: {
              label: "Capture",
              defaultValue: true
            },
            [`settings.${paymentMethodName[key]}.support`]: {
              label: "Refund",
              defaultValue: true
            }
          }
        }, {
          type: Boolean
        });
      });
    }
  },
  down() {

  }
});
