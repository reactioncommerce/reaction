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
  let userId;

  before(function (done) {
    this.timeout(20000);
    Reaction.onAppStartupComplete(() => {
      Fixtures();
      shop = getShop();
      shopId = shop._id;
      userId = getUser()._id;

      methods = {
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
