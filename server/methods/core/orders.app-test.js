import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { Orders, Media, Notifications, Products, Shops } from "/lib/collections";


Fixtures();
// examplePaymentMethod();

describe("orders test", function () {
  let methods;
  let sandbox;
  let order;
  let example;
  let shop;

  before(function (done) {
    methods = {
      "cancelOrder": Meteor.server.method_handlers["orders/cancelOrder"],
      "shipmentPacked": Meteor.server.method_handlers["orders/shipmentPacked"],
      "makeAdjustmentsToInvoice": Meteor.server.method_handlers["orders/makeAdjustmentsToInvoice"],
      "approvePayment": Meteor.server.method_handlers["orders/approvePayment"],
      "shipmentShipped": Meteor.server.method_handlers["orders/shipmentShipped"],
      "shipmentDelivered": Meteor.server.method_handlers["orders/shipmentDelivered"],
      "sendNotification": Meteor.server.method_handlers["orders/sendNotification"],
      "updateShipmentTracking": Meteor.server.method_handlers["orders/updateShipmentTracking"],
      "addOrderEmail": Meteor.server.method_handlers["orders/addOrderEmail"],
      "updateHistory": Meteor.server.method_handlers["orders/updateHistory"],
      "capturePayments": Meteor.server.method_handlers["orders/capturePayments"],
      "refunds/list": Meteor.server.method_handlers["orders/refunds/list"],
      "refunds/create": Meteor.server.method_handlers["orders/refunds/create"],
      "example/payment/capture": Meteor.server.method_handlers["example/payment/capture"]
    };

    example = Factory.create("examplePaymentPackage");
    return done();
  });

  beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    // });
    sandbox.stub(Orders._hookAspects.insert.before[0], "aspect");
    sandbox.stub(Orders._hookAspects.update.before[0], "aspect");
    sandbox.stub(Meteor.server.method_handlers, "inventory/register", function () {
      check(arguments, [Match.Any]);
    });
    sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function () {
      check(arguments, [Match.Any]);
    });

    shop = Factory.create("shop");
    order = Factory.create("order");
    sandbox.stub(Reaction, "getShopId", () => order.shopId);
    const paymentMethod = order.billing[0].paymentMethod;
    sandbox.stub(paymentMethod, "paymentPackageId", example._id);
    return done();
  });

  afterEach(function (done) {
    Orders.remove({});
    sandbox.restore();
    return done();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `orders/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, arguments);
    });
  }

  function orderCreditMethod(orderData) {
    return orderData.billing.filter(value => value.paymentMethod.method ===  "credit")[0];
  }

  describe("orders/cancelOrder", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
    });

    it("should return an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const returnToStock =  false;
      spyOnMethod("cancelOrder", order.userId);

      function cancelOrder() {
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
      expect(cancelOrder).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should return the product to stock ", function () {
        // Mock user permissions
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = true;
      const previousProduct = Products.findOne({ _id: order.items[0].variants._id });
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const product = Products.findOne({ _id: order.items[0].variants._id });
      expect(previousProduct.inventoryQuantity).to.equal(product.inventoryQuantity);
    });

    it("should notify owner of the order, if the order is canceled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = true;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const notify = Notifications.findOne({ to: order.userId, type: "orderCancelled" });
      expect(notify.message).to.equal("Your order was canceled.");
    });

    it("should not return the product to stock", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      const previousProduct = Products.findOne({ _id: order.items[0].variants._id });
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const product = Products.findOne({ _id: order.items[0].variants._id });
      expect(previousProduct.inventoryQuantity).to.equal(product.inventoryQuantity + 1);
    });

    it("should update the payment method status and mode to refunded and canceled respectively ", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const Order = Orders.findOne({ _id: order._id });
      expect(Order.billing[0].paymentMethod.mode).to.equal("cancel");
    });

    it("should change the workflow status of the item to coreOrderItemWorkflow/canceled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/canceled");
    });
  });

  describe("orders/shipmentPacked", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = order.shipping[0];
      const packed = true;
      spyOnMethod("shipmentPacked", order, shipment, packed);

      function shipmentPacked() {
        return Meteor.call("orders/shipmentPacked", order, shipment, packed);
      }
      expect(shipmentPacked).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should update the order item workflow to coreOrderItemWorkflow/packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = order.shipping[0];
      const packed = true;
      spyOnMethod("shipmentPacked", order.userId);
      Meteor.call("orders/shipmentPacked", order, shipment, packed);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/packed");
    });

    it("should update the shipment as packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = order.shipping[0];
      const packed = true;
      spyOnMethod("shipmentPacked", order.userId);
      Meteor.call("orders/shipmentPacked", order, shipment, packed);
      const orderShipment = Orders.findOne({ _id: order._id }).shipping[0];
      expect(orderShipment.packed).to.equal(packed);
    });
  });

  describe("orders/makeAdjustmentsToInvoice", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("makeAdjustmentsToInvoice", order.userId);

      function makeAdjustmentsToInvoice() {
        return Meteor.call("orders/makeAdjustmentsToInvoice", order);
      }
      expect(makeAdjustmentsToInvoice).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should make adjustment to the invoice", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("makeAdjustmentsToInvoice", order.userId);
      Meteor.call("orders/makeAdjustmentsToInvoice", order);
      const orderPaymentMethodStatus = Orders.findOne({ _id: order._id }).billing[0].paymentMethod.status;
      expect(orderPaymentMethodStatus).equal("adjustments");
    });
  });

  describe("orders/approvePayment", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("approvePayment", order.userId);
      function approvePayment() {
        return Meteor.call("orders/approvePayment", order);
      }
      expect(approvePayment).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should approve payment", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("approvePayment", order.userId);
      const invoice = orderCreditMethod(order).invoice;
      const subTotal = invoice.subtotal;
      const shipping = invoice.shipping;
      const taxes = invoice.taxes;
      const discount = invoice.discounts;
      const discountTotal = Math.max(0, subTotal - discount); // ensure no discounting below 0.
      const total = accounting.toFixed(discountTotal + shipping + taxes, 2);
      Meteor.call("orders/approvePayment", order);
      const orderBilling = Orders.findOne({ _id: order._id }).billing[0];
      expect(orderBilling.paymentMethod.status).to.equal("approved");
      expect(orderBilling.paymentMethod.mode).to.equal("capture");
      expect(orderBilling.invoice.discounts).to.equal(discount);
      expect(orderBilling.invoice.total).to.equal(Number(total));
    });
  });

  describe("orders/shipmentShipped", function () {
    it("should throw an error if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("shipmentShipped", order.userId);
      function shipmentShipped() {
        return Meteor.call("orders/shipmentShipped", order, order.shipping[0]);
      }
      expect(shipmentShipped).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, order.shipping[0]);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/completed");
    });

    it("should update the order workflow status to completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, order.shipping[0]);
      const orderStatus = Orders.findOne({ _id: order._id }).workflow.status;
      expect(orderStatus).to.equal("coreOrderWorkflow/completed");
    });

    it("should update the order shipping status", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, order.shipping[0]);
      const orderShipped = Orders.findOne({ _id: order._id }).shipping[0].shipped;
      expect(orderShipped).to.equal(true);
    });
  });

  describe("orders/shipmentDelivered", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
    });

    it("should throw an error if user does not have permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("shipmentDelivered", order.userId);
      function shipmentDelivered() {
        return Meteor.call("orders/shipmentDelivered", order);
      }
      expect(shipmentDelivered).to.throw(Meteor.Error, /Access Denied/);
    });

    it("should update the order item workflow to coreOrderItemWorkflow/completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderItemWorkflow = Orders.findOne({ _id: order._id }).items[0].workflow;
      expect(orderItemWorkflow.status).to.equal("coreOrderItemWorkflow/completed");
    });

    it("should update the delivered status to true", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderShipping = Orders.findOne({ _id: order._id }).shipping[0];
      expect(orderShipping.delivered).to.equal(true);
    });

    it("should update the order workflow status to processing", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderWorkflow = Orders.findOne({ _id: order._id }).workflow;
      expect(orderWorkflow.status).to.equal("coreOrderWorkflow/processing");
    });
  });

  describe("orders/sendNotification", function () {
    it("should return access denied if userId is not availble", function () {
      spyOnMethod("sendNotification");
      function sendNotification() {
        return Meteor.call("orders/sendNotification", order);
      }
      expect(sendNotification).to.throw(Meteor.error, /Access Denied/);
    });

    it("should send email notification", function () {
      spyOnMethod("sendNotification", order.userId);
      sandbox.stub(Media, "findOne", () => {
        // stub url method for media file
        const url = () => "/stub/url";
        return {
          url
        };
      });
      sandbox.stub(Shops, "findOne", () => shop);
      const result = Meteor.call("orders/sendNotification", order);
      expect(result).to.be.true;
    });
  });

  describe("orders/updateShipmentTracking", function () {
    it("should return an error if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("updateShipmentTracking", order.userId);
      function updateShipmentTracking() {
        const trackingValue = "2340FLKD104309";
        return Meteor.call("orders/updateShipmentTracking", order, order.shipping[0], trackingValue);
      }
      expect(updateShipmentTracking).to.throw(Meteor.error, /Access Denied/);
    });

    it("should update the order tracking value", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("updateShipmentTracking", order.userId);
      const trackingValue = "2340FLKD104309";
      Meteor.call("orders/updateShipmentTracking", order, order.shipping[0], trackingValue);
      const orders = Orders.findOne({ _id: order._id });
      expect(orders.shipping[0].tracking).to.equal(trackingValue);
    });
  });

  describe("orders/addOrderEmail", function () {
    it("should return if userId is not available", function () {
      spyOnMethod("addOrderEmail");
      function addOrderEmail() {
        const email = "sample@email.com";
        return Meteor.call("orders/addOrderEmail", order.cartId, email);
      }
      expect(addOrderEmail).to.throw(Meteor.error, /Access Denied. You are not connected./);
    });

    it("should add the email to the order", function () {
      spyOnMethod("addOrderEmail", order.userId);
      const email = "sample@email.com";
      Meteor.call("orders/addOrderEmail", order.cartId, email);
      const orders = Orders.findOne({ _id: order._id });
      expect(orders.email).to.equal(email);
    });
  });

  describe("orders/updateHistory", function () {
    it("should return Access denied if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("updateHistory", order.userId);
      function updateHistory() {
        const trackingValue = "65TFYTGFCHCUJVR66";
        return Meteor.call("orders/updateHistory", order._id, "Tracking added", trackingValue);
      }
      expect(updateHistory).to.throw(Meteor.error, /Access Denied/);
    });

    it("should update the order history for the item", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("updateHistory", order.userId);
      const trackingValue = "65TFYTGFCHCUJVR66";
      const event = "Tracking added";
      Meteor.call("orders/updateHistory", order._id, event, trackingValue);
      const orders = Orders.findOne({ _id: order._id });
      expect(orders.history[0].event).to.equal(event);
      expect(orders.history[0].value).to.equal(trackingValue);
      expect(orders.history[0].userId).to.equal(order.userId);
    });
  });

  describe("orders/capturePayments", function () {
    beforeEach(function (done) {
      Orders.update({
        "_id": order._id,
        "billing.paymentMethod.transactionId": order.billing[0].paymentMethod.transactionId
      }, {
        $set: {
          "billing.$.paymentMethod.mode": "capture",
          "billing.$.paymentMethod.status": "approved"
        }
      });
      return done();
    });

    it("should return access denied if user does not have access", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("capturePayments", order.userId);
      function capturePayments() {
        return Meteor.call("orders/capturePayments", order._id);
      }
      expect(capturePayments).to.throw(Meteor.error, /Access Denied/);
    });

    it("should update the order item workflow to coreOrderItemWorkflow/captured", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("capturePayments", order.userId);
      Meteor.call("orders/capturePayments", order._id);
      const orderItemWorkflow = Orders.findOne({ _id: order._id }).items[0].workflow;
      expect(orderItemWorkflow.status).to.equal("coreOrderItemWorkflow/captured");
    });

    it("should update the order after the payment processor has captured the payment", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("capturePayments", order.userId);
      Meteor.call("orders/capturePayments", order._id, () => {
        const orderPaymentMethod = Orders.findOne({ _id: order._id }).billing[0].paymentMethod;
        expect(orderPaymentMethod.mode).to.equal("capture");
        expect(orderPaymentMethod.status).to.equal("completed");
      });
      return done();
    });

    it("should update order payment method status to error if payment processor fails", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("capturePayments", order.userId);
      sandbox.stub(Meteor.server.method_handlers, "example/payment/capture", function () {
        check(arguments, [Match.Any]);
        return {
          error: "stub error",
          saved: false
        };
      });
      Meteor.call("orders/capturePayments", order._id, () => {
        const orderPaymentMethod = Orders.findOne({ _id: order._id }).billing[0].paymentMethod;
        expect(orderPaymentMethod.mode).to.equal("capture");
        expect(orderPaymentMethod.status).to.equal("error");
      });
      return done();
    });
  });

  describe("orders/refunds/list", function () {
    it("should return an array of refunds", function () {
      sandbox.stub(Reaction, "hasPermission",  () => true);
      spyOnMethod("refunds/list", order.userId);
      Meteor.call("orders/refunds/list", order, (err, res) => {
        // refunds would be empty because there isn't any refunds yet
        expect(res.length).to.equal(0);
      });
    });
  });

  describe("orders/refunds/create", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
        check(arguments, [Match.Any]);
      });
    });

    it("should return error if user is does not have admin permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("refunds/create", order.userId);
      function refundsCreate() {
        const amount = 5.20;
        return Meteor.call("orders/refunds/create", order._id, order.billing[0].paymentMethod, amount);
      }
      expect(refundsCreate).to.throw(Meteor.error, /Access Denied/);
    });

    it("should update the order as refunded", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("refunds/create", order.userId);
      const amount = 5.20;
      Meteor.call("orders/refunds/create", order._id, order.billing[0].paymentMethod, amount);
      const updateOrder = Orders.findOne({ _id: order._id });
      expect(updateOrder.billing[0].paymentMethod.status).to.equal("refunded");
    });
  });
});
