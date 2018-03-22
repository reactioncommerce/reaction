/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import { Factory } from "meteor/dburles:factory";
import { assert, expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("cart methods", function () {
  const shop = getShop();
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  // Required for creating a cart
  after(() => {
    Meteor.users.remove({});
  });

  describe("cart/removeFromCart", function () {
    beforeEach(function () {
      Collections.Cart.remove({});
    });

    it("should remove item from cart", function (done) {
      this.timeout(5000);
      const cart = Factory.create("cart");
      const cartUserId = cart.userId;
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => cartUserId);
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function (...args) {
        check(args, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function (...args) {
        check(args, [Match.Any]);
      });
      const updateSpy = sandbox.spy(Collections.Cart, "update");
      const cartFromCollection = Collections.Cart.findOne(cart._id);
      const cartItemId = cartFromCollection.items[0]._id;
      assert.equal(cartFromCollection.items.length, 2);
      Meteor.call("cart/removeFromCart", cartItemId);
      // The cart/removeFromCart method will trigger the hook
      // afterCartUpdateCalculateDiscount 4 times.
      assert.equal(updateSpy.callCount, 4, "update should be called four times");
      Meteor._sleepForMs(1000);
      const updatedCart = Collections.Cart.findOne(cart._id);
      assert.equal(updatedCart.items.length, 1, "there should be one item left in cart");
      return done();
    });

    it("should decrease the quantity when called with a quantity", function () {
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function (...args) {
        check(args, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function (...args) {
        check(args, [Match.Any]);
      });
      const cart = Factory.create("cartTwo");
      const cartUserId = cart.userId;
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => cartUserId);
      const cartFromCollection = Collections.Cart.findOne(cart._id);
      const cartItemId = cartFromCollection.items[0]._id;
      Meteor.call("cart/removeFromCart", cartItemId, 1);
      Meteor._sleepForMs(500);
      const updatedCart = Collections.Cart.findOne(cart._id);
      expect(updatedCart.items[0].quantity).to.equal(1);
    });

    it("should remove cart item when quantity is decresed to zero", function () {
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function (...args) {
        check(args, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function (...args) {
        check(args, [Match.Any]);
      });
      const cart = Factory.create("cartOne");
      const cartUserId = cart.userId;
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => cartUserId);
      const cartFromCollection = Collections.Cart.findOne(cart._id);
      const cartItemId = cartFromCollection.items[0]._id;
      const originalQty = cartFromCollection.items[0].quantity;
      Meteor.call("cart/removeFromCart", cartItemId, originalQty);
      Meteor._sleepForMs(500);
      const updatedCart = Collections.Cart.findOne(cart._id);
      expect(updatedCart.items.length).to.equal(0);
    });

    it("should throw an exception when attempting to remove item from cart of another user", function (done) {
      const cart = Factory.create("cart");
      const cartItemId = "testId123";

      sandbox.stub(Meteor, "userId", function () {
        return cart.userId;
      });

      function removeFromCartFunc() {
        return Meteor.call("cart/removeFromCart", cartItemId);
      }
      expect(removeFromCartFunc).to.throw(Meteor.Error, /not-found/);
      return done();
    });

    it("should throw an exception when attempting to remove non-existing item", function (done) {
      const cart = Factory.create("cart");
      const cartItemId = Random.id();
      sandbox.stub(Meteor, "userId", function () {
        return cart.userId;
      });

      function removeFromCartFunc() {
        return Meteor.call("cart/removeFromCart", cartItemId);
      }
      expect(removeFromCartFunc).to.throw(Meteor.Error, /not-found/);
      return done();
    });
  });
});
