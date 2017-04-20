import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
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
      cancelOrder: Meteor.server.method_handlers["orders/cancelOrder"]
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
    sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function () {
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

  describe("orders/cancelOrder", function () {
    it("should return an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const returnToStock =  false;
      spyOnMethod("cancelOrder", order.userId);

      function copyStartCancelOrder() {
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
      expect(copyStartCancelOrder).to.throw(Meteor.Error, /Access Denied/);
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
});
