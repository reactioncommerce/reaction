import { Migrations } from "meteor/percolate:migrations";
import { Orders, Packages } from "/lib/collections";

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
      const newBilling = order.billing.map((billing) => {
        const packageData = Packages.findOne({
          name: paymentNameDict[billing.paymentMethod.processor],
          shopId: billing.shopId
        });
        const registry = packageData && Array.isArray(packageData.registry)
          && packageData.registry[0] && packageData.registry[0];
        // create key in similar pattern created in Packages pub transform
        const settingsKey = (registry.name || packageData.name).split("/").splice(-1)[0];
        const cartItems = order.items.map((item) => ({
          _id: item._id,
          productId: item.productId,
          variantId: item.variants._id,
          shopId: item.shopId,
          quantity: item.quantity
        }));

        billing.paymentMethod.paymentPackageId = packageData && packageData._id;
        billing.paymentMethod.paymentSettingsKey = settingsKey;
        billing.paymentMethod.shopId = billing.shopId;
        billing.paymentMethod.items = cartItems;
        return billing;
      });

      Orders.update({ _id: order._id }, {
        $set: { billing: newBilling }
      }, { bypassCollection2: true });
    });
  },
  down() {
    Orders.find().forEach((order) => {
      order.billing.forEach((billing) => {
        delete billing.paymentMethod.paymentPackageId;
        delete billing.paymentMethod.paymentSettingsKey;
        delete billing.paymentMethod.shopId;
        delete billing.paymentMethod.items;
      });
      Orders.update({ _id: order._id }, {
        $set: { items: order.billing }
      }, { bypassCollection2: true });
    });
  }
});
