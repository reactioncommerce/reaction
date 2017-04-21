import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import accounting from "accounting-js";
import { Reaction } from "/server/api";
import { Orders, Products, Notifications } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
// import { examplePaymentMethod } from "/server/imports/fixtures/packages";

Fixtures();
// examplePaymentMethod();

describe("orders test", function () {
  let methods;
  let sandbox;
  let order;
  let example;

  before(function (done) {
    methods = {
      cancelOrder: Meteor.server.method_handlers["orders/cancelOrder"],
      shipmentPacked: Meteor.server.method_handlers["orders/shipmentPacked"],
      makeAdjustmentsToInvoice: Meteor.server.method_handlers["orders/makeAdjustmentsToInvoice"],
      approvePayment: Meteor.server.method_handlers["orders/approvePayment"]
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

    Factory.create("shop");
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

      function CancelOrder() {
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
      expect(CancelOrder).to.throw(Meteor.Error, /Access Denied/);
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
      console.log(total, "total");
      console.log(typeof total, "type");
      Meteor.call("orders/approvePayment", order);
      const orderBilling = Orders.findOne({ _id: order._id }).billing[0];
      expect(orderBilling.status).to.equal("approved");
      expect(orderBilling.mode).to.equal("capture");
      expect(orderBilling.invoice.discounts).to.equal(discount);
      expect(orderBilling.invoice.total).to.equal(total);
    });
  });
});
