/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
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
      let cart = Factory.create("cart");
      const cartUserId = cart.userId;
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => cartUserId);
      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function () {
        check(arguments, [Match.Any]);
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function () {
        check(arguments, [Match.Any]);
      });
      let updateSpy = sandbox.spy(Collections.Cart, "update");
      let cartFromCollection = Collections.Cart.findOne(cart._id);
      const cartItemId = cartFromCollection.items[0]._id;
      assert.equal(cartFromCollection.items.length, 2);
      Meteor.call("cart/removeFromCart", cartItemId);
      assert.equal(updateSpy.callCount, 1, "update should be called one time");
      Meteor._sleepForMs(1000);
      let updatedCart = Collections.Cart.findOne(cart._id);
      assert.equal(updatedCart.items.length, 1, "there should be one item left in cart");
      return done();
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
      expect(removeFromCartFunc).to.throw(Meteor.Error, /item not found/);
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
      expect(removeFromCartFunc).to.throw(Meteor.Error, /item not found/);
      return done();
    });
  });
});
