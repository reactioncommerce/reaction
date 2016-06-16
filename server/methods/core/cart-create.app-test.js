/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Cart, Products, Accounts } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import { getShop } from "/server/imports/fixtures/shops";
import { addProduct } from "/server/imports/fixtures/products";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";
import Fixtures from "/server/imports/fixtures";

Fixtures();


function monkeyPatchMethod(method, id) {
  Meteor.server.method_handlers[`cart/${method}`] = function () {
    check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
    this.userId = id;
    console.log("calling monkey patched function " + method);
    return originals[method].apply(this, arguments);
  };
}

function resetAllMonkeyPatch() {
  for (let key of Object.keys(originals)) {
    let methodName = `cart/${key}`;
    console.log(`resetting ${methodName} back to: ${originals[methodName]}`);
    Meteor.server.method_handlers[methodName] = originals[methodName];
  }
}

function resetMonkeyPatch(method) {
  console.log("resetMonkeyPatch originals: " + originals);
  Meteor.server.method_handlers[`cart/${method}`] = originals[method];
}


describe("cart methods", function () {
  let user = Factory.create("user");
  const shop = getShop();
  let userId = user._id;
  const sessionId = Reaction.sessionId = Random.id();

  after(() => {
    Meteor.users.remove({});
  });

  // describe("Cart create/add", () => {
  //   before(() => {
  //     // We are mocking inventory hooks, because we don't need them here, but
  //     // if you want to do a real stress test, you could try to comment out
  //     // this two lines and uncomment the following spyOn line. This is needed
  //     // only for `./reaction test`. In one package test this is ignoring.
  //     if (Array.isArray(Reaction.Collections.Products._hookAspects.remove.
  //         after) && Reaction.Collections.Products._hookAspects.remove.after.
  //         length) {
  //       spyOn(Reaction.Collections.Cart._hookAspects.update.after[0],
  //         "aspect");
  //       spyOn(Reaction.Collections.Products._hookAspects.remove.after[0],
  //         "aspect");
  //     }
  //
  //     // this is needed for `inventory/remove`. Don't ask me why;)
  //     // spyOn(Reaction, "hasPermission").and.returnValue(true);
  //     Reaction.Collections.Products.remove({});
  //
  //     // mock it. If you want to make full integration test, comment this out
  //     spyOn(Meteor.server.method_handlers, "workflow/pushCartWorkflow").and.
  //     callFake(() => true);
  //   });
  //
  //   beforeEach(() => {
  //     Reaction.Collections.Cart.remove({});
  //   });
  // });

  describe.skip("cart/createCart", function () {
    it("should create a test cart", function (done) {
      stubs.create("shopIdAutoValue");
      stubs.shopIdAutoValue.returns(shop._id);
      // spyOn(Reaction, "shopIdAutoValue").and.returnValue(shop._id);
      stubs.create("getShopIdStub", Reaction, "getShopId");
      stubs.getShopIdStub.returns(shop._id);
      // spyOn(Reaction, "getShopId").and.returnValue(shop._id);
      monkeyPatchMethod("createCart", userId);
      spies.create("cartInsertSpy", Cart, "insert");
      // spyOn(Reaction.Collections.Cart, "insert").and.callThrough();
      let cartId = Meteor.call("cart/createCart", userId, sessionId);
      let cart = Cart.findOne({
        userId: userId
      });
      expect(spies.cartInsertSpy).to.have.been.called;
      expect(cartId).to.equal(cart._id);
      resetMonkeyPatch("createCart");
      done();
    });
  });

  describe("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    before(function () {
      // this is needed for `inventory/register`
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(true);
      // spyOn(Reaction, "hasPermission").and.returnValue(true);
      stubs.create("resetShippingStub", Meteor.server.method_handlers, "cart/resetShipmentMethod");
      stubs.resetShippingStub.returns(true);

      product = addProduct();
      productId = product._id;
      variantId = Products.findOne({
        ancestors: [productId]
      })._id;
    });

    afterEach(function () {
      spies.restoreAll();
      stubs.restoreAll();
    });

    beforeEach(function () {
      Cart.remove({});
      spies.restoreAll();
      stubs.restoreAll();
    });

    it("should add item to cart", function (done) {
      let cart = Factory.create("cart");
      let items = cart.items.length;
      monkeyPatchMethod("addToCart", cart._id);
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      cart = Cart.findOne(cart._id);
      expect(cart.items.length).to.equal(items + 1);
      expect(cart.items[cart.items.length - 1].productId).to.equal(productId);
      resetMonkeyPatch("addToCart");
      done();
    });

    it("should merge all items of same variant in cart", function (done) {
      let cart = Factory.create("cart");
      stubs.create("shopIdAutoValueStub", shopIdAutoValue, "call");
      stubs.shopIdAutoValueStub.returns(shop._id);
      stubs.create("getShopIdStub", Reaction, "getShopId");
      stubs.getShopIdStub.returns(shop._id);
      // spyOn(Reaction, "getShopId").and.returnValue(shop._id);
      monkeyPatchMethod("addToCart", cart.userId);
      // const cartId = Meteor.call("cart/createCart", userId, sessionId);

      Meteor.call("cart/addToCart", productId, variantId, quantity);
      // add a second item of same variant
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      let cartFromDb = Cart.findOne(cart._id);

      expect(cartFromDb.items.length).to.equal(1);
      expect(cartFromDb.items[0].quantity).to.equal(2);
      resetMonkeyPatch("addToCart");
      return done();
    });

    it("should throw error an exception if user doesn't have a cart", function (done) {
      const userWithoutCart = Factory.create("user");
      monkeyPatchMethod("addToCart", userWithoutCart._id);
      let addToCartFunc = function () {
        return Meteor.call("cart/addToCart", productId, variantId, quantity);
      };
      expect(addToCartFunc).to.throw(Meteor.Error, /Cart not found/);
      resetMonkeyPatch("addToCart");
      return done();
    });

    it("should throw error an exception if product doesn't exists", function (done) {
      const cart = Factory.create("cart");
      monkeyPatchMethod("addToCart", cart.userId);
      let addToCartFunc = function () {
        return Meteor.call("cart/addToCart", "fakeProductId", variantId, quantity);
      };
      expect(addToCartFunc).to.throw(Meteor.Error, /Product not found [404]/);
      resetMonkeyPatch("addToCart");
      return done();
    });
  });

  describe.skip("cart/copyCartToOrder", function () {
    it("should throw error if cart user not current user", function (done) {
      const cart = Factory.create("cart");
      monkeyPatchMethod("copyCartToOrder", "wrongUserId");
      let copyCartFunc = function () {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      };
      expect(copyCartFunc).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });

    it("should throw error if cart has not items", function (done) {
      const user1 = Factory.create("user");
      spyOn(Reaction, "getShopId").and.returnValue(shop._id);
      spyOn(Accounts, "findOne").and.returnValue({
        emails: [{
          address: "test@localhost",
          provides: "default"
        }]
      });
      spyOnMethod("copyCartToOrder", user1._id);
      const cartId = Meteor.call("cart/createCart", user1._id, sessionId);
      expect(cartId).toBeDefined();
      expect(() => {
        return Meteor.call("cart/copyCartToOrder", cartId);
      }).to.throw(new Meteor.Error("An error occurred saving the order." +
        " Missing cart items."));

      return done();
    });

    it("should throw an error if order creation was failed", function (done) {
      const cart = Factory.create("cartToOrder");
      spyOnMethod("copyCartToOrder", cart.userId);
      // The main moment of test. We are spy on `insert` operation but do not
      // let it through this call
      spyOn(Reaction.Collections.Orders, "insert");
      expect(() => {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      }).to.throw(new Meteor.Error(400,
        "cart/copyCartToOrder: Invalid request"));
      expect(Reaction.Collections.Orders.insert).toHaveBeenCalled();
      return done();
    });

    it("should create an order", function (done) {
      let cart = Factory.create("cartToOrder");
      spyOn(Reaction, "shopIdAutoValue").and.returnValue(cart.shopId);
      spyOn(Reaction, "getShopId").and.returnValue(cart.shopId);
      spyOnMethod("copyCartToOrder", cart.userId);
      // let's keep it simple. We don't want to see a long email about
      // success. But I leave it here in case if anyone want to check whole
      // method flow.
      spyOn(Reaction.Collections.Orders, "insert");// .and.callThrough();
      // const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
      expect(() => Meteor.call("cart/copyCartToOrder", cart._id)).
      to.throw(new Meteor.Error(400,
        "cart/copyCartToOrder: Invalid request"));
      // we are satisfied with the following check
      expect(Reaction.Collections.Orders.insert).toHaveBeenCalled();
      // expect(typeof orderId).toEqual("string");

      return done();
    });
  });

  describe.skip("cart/unsetAddresses", function () {
    it("should correctly remove addresses from cart", function (done) {
      let cart = Factory.create("cart");
      spyOnMethod("setShipmentAddress", cart.userId);
      spyOnMethod("setPaymentAddress", cart.userId);

      const cartId = cart._id;
      const address = Object.assign({}, faker.reaction.address(), {
        _id: Random.id(),
        isShippingDefault: true,
        isBillingDefault: true
      });

      Meteor.call("cart/setPaymentAddress", cartId, address);
      Meteor.call("cart/setShipmentAddress", cartId, address);
      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address._id).toEqual(address._id);
      expect(cart.billing[0].address._id).toEqual(address._id);

      // our Method checking
      Meteor.call("cart/unsetAddresses", address._id, cart.userId);

      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address).to.be.undefined;
      expect(cart.billing[0].address).to.be.undefined;

      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      stubs.create("accountUpdateStub", Accounts, "update");

      expect(function () {
        return Meteor.call("cart/unsetAddresses", 123456);
      }).to.throw;

      expect(function () {
        return Meteor.call("cart/unsetAddresses", {});
      }).to.throw;

      expect(function () {
        return Meteor.call("cart/unsetAddresses", null);
      }).to.throw;

      expect(function () {
        return Meteor.call("cart/unsetAddresses");
      }).to.throw;

      expect(function () {
        return Meteor.call("cart/unsetAddresses", "asdad", 123);
      }).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookRemove", () => {
            console.log("test");
          }
        );
      }).not.to.throw;

      expect(stubs.accountUpdateStub).to.not.have.been.called;
      return done();
    });

    it("should update cart via `type` argument", function (done) {
      let cart = Factory.create("cart");
      spyOnMethod("setShipmentAddress", cart.userId);
      spyOnMethod("setPaymentAddress", cart.userId);

      const cartId = cart._id;
      const address = Object.assign({}, faker.reaction.address(), {
        _id: Random.id(),
        isShippingDefault: true,
        isBillingDefault: true
      });
      Meteor.call("cart/setPaymentAddress", cartId, address);
      Meteor.call("cart/setShipmentAddress", cartId, address);
      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address._id).toEqual(address._id);
      expect(cart.billing[0].address._id).toEqual(address._id);

      Meteor.call("cart/unsetAddresses", address._id, cart.userId,
        "billing");
      Meteor.call("cart/unsetAddresses", address._id, cart.userId,
        "shipping");

      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address).toBeUndefined();
      expect(cart.billing[0].address).toBeUndefined();

      return done();
    });
  });
});
