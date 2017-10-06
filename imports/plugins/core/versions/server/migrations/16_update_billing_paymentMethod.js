import { Migrations } from "meteor/percolate:migrations";
import { Cart, Orders, Packages } from "/lib/collections";

const paymentNameDict = {
  Example: "example-paymentmethod",
  Braintree: "reaction-braintree",
  AuthNet: "reaction-auth-net",
  PaypalExpress: "reaction-paypal",
  PayflowPro: "reaction-paypal",
  Stripe: "reaction-stripe"
};

Migrations.add({
  version: 16,
  up() {
    Orders.find().forEach((order) => {
      order.billing.forEach((billing) => {
        const packageData = Packages.findOne({
          name: paymentNameDict[billing.paymentMethod.processor],
          shopId: billing.shopId
        });
        const settingsKey = packageData && Array.isArray(packageData.registry)
          && packageData.registry[0] && packageData.registry[0].settingsKey;

        billing.paymentMethod.paymentPackageId = packageData && packageData._id;
        billing.paymentMethod.paymentSettingsKey = settingsKey;
      });

      Orders.update({ _id: order._id }, {
        $set: { billing: order.billing }
      });
    });
  },
  down() {

  }
});
