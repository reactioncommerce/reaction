/* eslint-disable require-jsdoc */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import ReactionError from "@reactioncommerce/reaction-error";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import { getUser } from "/imports/plugins/core/core/server/fixtures/users";
import { Orders } from "/lib/collections";

describe("orders test", function () {
  let example;
  let methods;
  let order;
  let sandbox;
  let shop;
  let shopId;
  let userId;

  before(function (done) {
    this.timeout(20000);
    Reaction.onAppStartupComplete(() => {
      Fixtures();
      shop = getShop();
      shopId = shop._id;
      userId = getUser()._id;

      methods = {
        "shipmentPicked": Meteor.server.method_handlers["orders/shipmentPicked"],
        "shipmentPacked": Meteor.server.method_handlers["orders/shipmentPacked"],
        "shipmentLabeled": Meteor.server.method_handlers["orders/shipmentLabeled"],
        "shipmentShipped": Meteor.server.method_handlers["orders/shipmentShipped"],
        "shipmentDelivered": Meteor.server.method_handlers["orders/shipmentDelivered"],
        "sendNotification": Meteor.server.method_handlers["orders/sendNotification"],
        "updateHistory": Meteor.server.method_handlers["orders/updateHistory"],
        "example/payment/capture": Meteor.server.method_handlers["example/payment/capture"]
      };

      example = Factory.create("examplePaymentPackage");

      done();
    });
  });

  beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    order = Factory.create("order");
    sandbox.stub(Reaction, "getShopId", () => order.shopId);
    sandbox.stub(Reaction, "getUserId", () => userId);
    sandbox.stub(order.payments[0], "paymentPluginName", example.name);
    return done();
  });

  afterEach(function (done) {
    Orders.remove({});
    sandbox.restore();
    return done();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `orders/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, args);
    });
  }

  function shippingObjectMethod(orderObject) {
    const shippingObject = orderObject.shipping.find((shipping) => shipping.shopId === shopId);
    return shippingObject;
  }

  describe("orders/shipmentPicked", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order, shipment);

      function shipmentPicked() {
        return Meteor.call("orders/shipmentPicked", order, shipment);
      }
      expect(shipmentPicked).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/picked", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order.accountId);
      Meteor.call("orders/shipmentPicked", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).shipping[0].items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/picked");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/picked", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order.accountId);
      Meteor.call("orders/shipmentPicked", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/picked");
    });
  });

  describe("orders/shipmentPacked", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order, shipment);

      function shipmentPacked() {
        return Meteor.call("orders/shipmentPacked", order, shipment);
      }
      expect(shipmentPacked).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order.accountId);
      Meteor.call("orders/shipmentPacked", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).shipping[0].items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/packed");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order.accountId);
      Meteor.call("orders/shipmentPacked", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/packed");
    });
  });

  describe("orders/shipmentLabeled", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order, shipment);

      function shipmentLabeled() {
        return Meteor.call("orders/shipmentLabeled", order, shipment);
      }
      expect(shipmentLabeled).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/labeled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order.accountId);
      Meteor.call("orders/shipmentLabeled", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).shipping[0].items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/labeled");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/labeled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order.accountId);
      Meteor.call("orders/shipmentLabeled", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/labeled");
    });
  });

  describe("orders/shipmentShipped", function () {
    it("should throw an error if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentShipped", order.accountId);
      function shipmentShipped() {
        return Meteor.call("orders/shipmentShipped", order, shipment);
      }
      expect(shipmentShipped).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.accountId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).shipping[0].items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/completed");
    });

    it("should update the order workflow status to completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.accountId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderStatus = Orders.findOne({ _id: order._id }).workflow.status;
      expect(orderStatus).to.equal("coreOrderWorkflow/completed");
    });

    it("should update the order shipping workflow status to coreOrderWorkflow/shipped", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.accountId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderShipped = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipped.workflow.status).to.equal("coreOrderWorkflow/shipped");
    });
  });

  describe("orders/shipmentDelivered", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
    });

    it("should throw an error if user does not have permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("shipmentDelivered", order.accountId);
      function shipmentDelivered() {
        return Meteor.call("orders/shipmentDelivered", order);
      }
      expect(shipmentDelivered).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/delivered", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.accountId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderItemWorkflow = Orders.findOne({ _id: order._id }).shipping[0].items[0].workflow;
      expect(orderItemWorkflow.status).to.equal("coreOrderItemWorkflow/delivered");
    });

    it("should update the order shipping workflow status to coreOrderWorkflow/delivered", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.accountId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderShipping = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipping.workflow.status).to.equal("coreOrderWorkflow/delivered");
    });
  });

  describe("orders/sendNotification", function () {
    it("should return access denied if userId is not available", function () {
      spyOnMethod("sendNotification");
      function sendNotification() {
        return Meteor.call("orders/sendNotification", order._id);
      }
      expect(sendNotification).to.throw(ReactionError, /Access Denied/);
    });
  });

  describe("orders/updateHistory", function () {
    it("should return Access denied if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("updateHistory", order.accountId);
      function updateHistory() {
        const trackingValue = "65TFYTGFCHCUJVR66";
        return Meteor.call("orders/updateHistory", order._id, "Tracking added", trackingValue);
      }
      expect(updateHistory).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order history for the item", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("updateHistory", order.accountId);
      const trackingValue = "65TFYTGFCHCUJVR66";
      const event = "Tracking added";
      Meteor.call("orders/updateHistory", order._id, event, trackingValue);
      const orders = Orders.findOne({ _id: order._id });
      expect(orders.history[0].event).to.equal(event);
      expect(orders.history[0].value).to.equal(trackingValue);
      expect(orders.history[0].userId).to.equal(userId);
    });
  });
});
