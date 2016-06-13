/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { assert, expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
// import Factory from "meteor/dburles:factory";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { shopIdAutoValue } from "/lib/collections/helpers";

Fixtures();


describe("cart methods", function () {
  const shop = getShop();

  before(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  // Required for creating a cart
  after(() => {
    Meteor.users.remove({});
    spies.restoreAll();
    stubs.restoreAll();
  });

  describe("cart/removeFromCart", function () {
    beforeEach(function () {
      Collections.Cart.remove({});
    });

    it(
      "should remove item from cart",
      function (done) {
        let cart = Factory.create("cart");
        const cartUserId = cart.userId;
        stubs.create("shopIdAutoValue");
        stubs.shopIdAutoValue.returns(shop._id);
        stubs.create("getShopId", Reaction, "getShopId");
        stubs.getShopId.returns(shop._id);
        stubs.create("userId", Meteor, "userId");
        stubs.userId.returns(cartUserId);
        sinon.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function () {
          check(arguments, [Match.Any]);
        });

        spies.create("updateSpy", Collections.Cart, "update");

        let cartFromCollection = Collections.Cart.findOne(cart._id);
        const cartItemId = cartFromCollection.items[0]._id;
        assert.equal(cartFromCollection.items.length, 2);
        Meteor.call("cart/removeFromCart", cartItemId);

        assert.equal(spies.updateSpy.callCount, 1, "update should be called one time");
        let updatedCart = Collections.Cart.findOne(cart._id);
        assert.equal(updatedCart.items.length, 1, "there should be one item left in cart");
        return done();
      }
    );

    // it(
    //   "should throw an exception when attempting to remove item from cart " +
    //   "of another user",
    //   function (done) {
    //     const cart = Factory.create("cart");
    //     const cartItemId = "testId123";
    //
    //     stubs.create("userId", Meteor, "userId");
    //     stubs.userId.returns(cart.userId);
    //     let removeFromCart = function () {
    //       return Meteor.call("cart/removeFromCart", cartItemId);
    //     };
    //     expect(removeFromCart).to.throw(Meteor.Error, /item not found/);
    //     return done();
    //   }
    // );

    // it(
    //   "should throw an exception when attempting to remove non-existing item",
    //   function (done) {
    //     const cart = Factory.create("cart");
    //     const cartItemId = Random.id();
    //     stubs.create("userId", Meteor, "userId");
    //     stubs.userId.returns(cart.userId);
    //     let removeFromCart = function () {
    //       return Meteor.call("cart/removeFromCart", cartItemId);
    //     };
    //     expect(removeFromCart).to.throw(Meteor.Error, /item not found/);
    //     return done();
    //   }
    // );
  });
});

// describe("cart methods", function () {
//   let user = Factory.create("user");
//   const shop = getShop();
//   let userId = user._id;
//   // Required for creating a cart
//   let originals = {};
//   originals["mergeCart"] = Meteor.server.method_handlers["cart/mergeCart"];
//   originals["copyCartToOrder"] = Meteor.server
//     .method_handlers["cart/copyCartToOrder"];
//   originals["addToCart"] = Meteor.server
//     .method_handlers["cart/addToCart"];
//   originals["setShipmentAddress"] = Meteor.server
//     .method_handlers["cart/setShipmentAddress"];
//   originals["setPaymentAddress"] = Meteor.server
//     .method_handlers["cart/setPaymentAddress"];
//
//   const sessionId = Reaction.sessionId = Random.id();
//
//   function spyOnMethod(method, id) {
//     return sinon.stub.create(Meteor.server.method_handlers, `cart/${method}`, function () {
//       this.userId = id;
//       return originals[method].apply(this, arguments);
//     });
//   }
//
//   after(() => {
//     Meteor.users.remove({});
//   });
//
//
//   describe("cart/createCart", function () {
//     it("should create a test cart", function (done) {
//       spyOnMethod("mergeCart", userId);
//
//       stubs.create("shopIdAutoValue", Reaction, "shopIdAutoValue");
//       stubs.shopIdAutoValue.returns(shop._id);
//       stubs.create("getShopId", Reaction, "getShopId");
//       stubs.getShopId.returns(shop._id);
//       spies.create("insertCart", Reaction.Collections.Cart, "insert");
//
//       let cartId = Meteor.call("cart/createCart", userId, sessionId);
//       let cart = ReactionCore.Collections.Cart.findOne({
//         userId: userId
//       });
//       // calledWith with no arguments seems to function as to.have.been.called
//       expect(spies.insertCart).to.have.been.calledWith();
//       expect(cartId).to.equal(cart._id);
//
//       done();
//     });
//   });
// });


