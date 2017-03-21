import { Meteor } from "meteor/meteor";
import _ from "lodash";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Orders, Products, Notifications } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("orders test", () => {
  let methods;
  let sandbox;
  let order;

  before(() => {
    methods = {
      startCancelOrder: Meteor.server.method_handlers["orders/startCancelOrder"],
      completeCancelOrder: Meteor.server.method_handlers["orders/completeCancelOrder"]
    };
  });

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    user = Factory.create("user");
    // sandbox.stub(Meteor, "userId", () => {
    //   return user._id;
    // });
    sandbox.stub(Orders._hookAspects.insert.before[0], "aspect");
    sandbox.stub(Orders._hookAspects.update.before[0], "aspect");
    sandbox.stub(Meteor.server.method_handlers, "inventory/register", function () {
      check(arguments, [Match.Any]);
    });
    sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function () {
      check(arguments, [Match.Any]);
    });
    order = Factory.create("order");
    return done();
  });

  afterEach(() => {
    Orders.remove({});
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `orders/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, arguments);
    });
  }

  describe("orders/startCancelOrder", () => {
    it("should return an error if user is not admin", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const returnToStock =  false;
      spyOnMethod("startCancelOrder", order.userId);

      function copyStartCancelOrder() {
        return Meteor.call("orders/startCancelOrder", order, returnToStock);
      }
      expect(copyStartCancelOrder).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });

    it("should return the product to stock ", (done) => {
        // Mock user permissions
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = true;
      const previousProduct = Products.findOne({ _id: order.items[0].variants._id });
      spyOnMethod("startCancelOrder", order.userId);
      Meteor.call("orders/startCancelOrder", order, returnToStock);
      const product = Products.findOne({ _id: order.items[0].variants._id });
      expect(previousProduct.inventoryQuantity).to.equal(product.inventoryQuantity);
      return done();
    });

    it("should not return the product to stock", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      const previousProduct = Products.findOne({ _id: order.items[0].variants._id });
      spyOnMethod("startCancelOrder", order.userId);
      Meteor.call("orders/startCancelOrder", order, returnToStock);
      const product = Products.findOne({ _id: order.items[0].variants._id });
      expect(previousProduct.inventoryQuantity).to.equal(product.inventoryQuantity + 1);
      return done();
    });

    it("should update the payment method status and mode to startCancel and refund respectively", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      spyOnMethod("startCancelOrder", order.userId);
      Meteor.call("orders/startCancelOrder", order, returnToStock);
      const Order = Orders.findOne({ _id: order._id });
      expect(Order.billing[0].paymentMethod.status).to.equal("startCancel");
      expect(Order.billing[0].paymentMethod.mode).to.equal("refund");
      return done();
    });
  });

  describe("orders/completeCancelOrder", () => {
    it("should return an error if user is not admin", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("completeCancelOrder", order.userId);

      function copyCompleteCancelOrder() {
        return Meteor.call("orders/completeCancelOrder", order);
      }
      expect(copyCompleteCancelOrder).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });

    it("should allow an admin complete the cancel order process", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("completeCancelOrder", order.userId);
      Meteor.call("orders/completeCancelOrder", order);
      const Order = Orders.findOne({ _id: order._id });
      expect(Order.workflow.status).to.equal("coreOrderWorkflow/canceled");
      return done();
    });

    it("should notify the owner the owner of the order, if the order is canceled", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("completeCancelOrder", order.userId);
      Meteor.call("orders/completeCancelOrder", order);
      const notify = Notifications.findOne({ to: order.userId, type: "orderCancelled" });
      expect(notify.message).to.equal("Your order was canceled.");
      return done();
    });

    it("should change the workflow status of the item to coreOrderItemWorkflow/canceled", (done) => {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("completeCancelOrder", order.userId);
      Meteor.call("orders/completeCancelOrder", order);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/canceled");
      return done();
    });
  });
});
