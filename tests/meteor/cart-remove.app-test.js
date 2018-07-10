/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { assert, expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import * as Collections from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

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
    let account;
    let accountId;
    let user;
    let userId;

    before(function () {
      user = Factory.create("user");
      userId = user._id;
      account = Factory.create("account", { userId });
      accountId = account._id;
    });

    beforeEach(function () {
      Collections.Cart.remove({});
    });

    it("should remove item from cart", function (done) {
      this.timeout(5000);
      const cart = Factory.create("cart", { accountId });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function (...args) {
        check(args, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function (...args) {
        check(args, [Match.Any]);
      });
      const updateSpy = sandbox.spy(Collections.Cart, "update");
      const cartFromCollection = Collections.Cart.findOne({ _id: cart._id });
      const cartItemId = cartFromCollection.items[0]._id;
      assert.equal(cartFromCollection.items.length, 2);
      Meteor.call("cart/removeFromCart", cartItemId);
      // The cart/removeFromCart method will trigger the hook
      // afterCartUpdateCalculateDiscount 4 times.
      assert.equal(updateSpy.callCount, 4, "update should be called four times");
      const updatedCart = Collections.Cart.findOne({ _id: cart._id });
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
      const cart = Factory.create("cartTwo", { accountId });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => userId);
      const cartFromCollection = Collections.Cart.findOne({ _id: cart._id });
      const cartItemId = cartFromCollection.items[0]._id;
      Meteor.call("cart/removeFromCart", cartItemId, 1);
      const updatedCart = Collections.Cart.findOne({ _id: cart._id });
      expect(updatedCart.items[0].quantity).to.equal(1);
    });

    it("should remove cart item when quantity is decreased to zero", function () {
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function (...args) {
        check(args, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function (...args) {
        check(args, [Match.Any]);
      });
      const cart = Factory.create("cartOne", { accountId });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => userId);
      const cartFromCollection = Collections.Cart.findOne({ _id: cart._id });
      const cartItemId = cartFromCollection.items[0]._id;
      const originalQty = cartFromCollection.items[0].quantity;
      Meteor.call("cart/removeFromCart", cartItemId, originalQty);
      const updatedCart = Collections.Cart.findOne({ _id: cart._id });
      expect(updatedCart.items.length).to.equal(0);
    });

    it("should throw an exception when attempting to remove item from cart of another user", function (done) {
      Factory.create("cart");
      const cartItemId = "testId123";

      sandbox.stub(Meteor, "userId", () => userId);

      function removeFromCartFunc() {
        return Meteor.call("cart/removeFromCart", cartItemId);
      }
      expect(removeFromCartFunc).to.throw(Meteor.Error, /not-found/);
      return done();
    });

    it("should throw an exception when attempting to remove non-existing item", function (done) {
      const cartItemId = Random.id();
      sandbox.stub(Meteor, "userId", () => userId);

      function removeFromCartFunc() {
        return Meteor.call("cart/removeFromCart", cartItemId);
      }
      expect(removeFromCartFunc).to.throw(Meteor.Error, /not-found/);
      return done();
    });
  });
});
