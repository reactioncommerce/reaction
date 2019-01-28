import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 55,
  up() {
    findAndConvertInBatches({
      collection: Orders,
      converter: (order) => {
        // Check if already converted
        if (!order.payments) return order;

        order.payments = [];

        order.shipping = order.shipping.map((group) => {
          const { payment } = group;

          // Check if already converted
          if (!payment) return group;

          // Removed invoice from payments because it's on each fulfillment group already
          delete payment.invoice;

          // Removed data.billingAddress from all payments because it's on payment.address already
          if (payment.data) delete payment.data.billingAddress;

          // Remove _id from billing address
          if (payment.address) {
            delete payment.address._id;
            order.billingAddress = payment.address;
          }

          // Moved all payments up to the `order` level
          delete group.payment;
          order.payments.push(payment);

          // Remove _id from shipping address
          if (group.address) delete group.address._id;

          // Add currencyCode to invoice
          group.invoice.currencyCode = payment.currencyCode;

          return group;
        });

        return order;
      }
    });
  },
  down() {
    findAndConvertInBatches({
      collection: Orders,
      converter: (order) => {
        // Check if already converted
        if (!order.payments) return order;

        order.shipping = order.shipping.map((group, index) => {
          const payment = order.payments[index];

          if (payment) {
            payment.invoice = group.invoice;
            if (payment.data) {
              payment.data.billingAddress = payment.address;
            }
            group.payment = payment;
          }

          // Remove currencyCode from invoice
          delete group.invoice.currencyCode;

          return group;
        });

        delete order.payments;

        return order;
      }
    });
  }
});
