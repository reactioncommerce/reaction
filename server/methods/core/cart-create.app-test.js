/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Cart, Products, Accounts } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import { addProduct } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";

Fixtures();


describe("Add/Create cart methods", function () {
  let user = Factory.create("user");
  const shop = getShop();
  let userId = user._id;
  const sessionId = Reaction.sessionId = Random.id();
  let sandbox;
  let originals;

  before(function () {
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      createCart: Meteor.server.method_handlers["cart/createCart"],
      copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"],
      setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
      setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
    };
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  after(() => {
    Meteor.users.remove({});
  });

  afterEach(function () {
    Meteor.users.remove({});
  });


  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      sandbox.stub(Reaction, "getShopId", function () {
        return shop._id;
      });

      let createSpy = spyOnMethod("createCart", userId);
      let cartInsertSpy = sinon.spy(Cart, "insert");

      // spyOn(Reaction.Collections.Cart, "insert").and.callThrough();
      let cartId = Meteor.call("cart/createCart", userId, sessionId);
      let cart = Cart.findOne({
        userId: userId
      });
      expect(cartInsertSpy).to.have.been.called;
      expect(cartId).to.equal(cart._id);
      createSpy.restore();
      cartInsertSpy.restore();
      done();
    });
  });

  describe.skip("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    before(function () {

      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });

      sandbox.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function () {
        return true;
      });
      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function () {
        return true;
      });

      sandbox.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes");
      product = addProduct();
      productId = product._id;
      variantId = Products.findOne({
        ancestors: [productId]
      })._id;
    });

    it("should add item to cart", function (done) {
      let cart = Factory.create("cart");
      let items = cart.items.length;
      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      Meteor._sleepForMs(500);
      cart = Cart.findOne(cart._id);
      expect(cart.items.length).to.equal(items + 1);
      expect(cart.items[cart.items.length - 1].productId).to.equal(productId);
      done();
    });


    it("should throw error an exception if user doesn't have a cart", function (done) {
      const userWithoutCart = Factory.create("user");
      spyOnMethod("addToCart", userWithoutCart._id);
      function addToCartFunc() {
        return Meteor.call("cart/addToCart", productId, variantId, quantity);
      }
      expect(addToCartFunc).to.throw(Meteor.Error, /Cart not found/);
      return done();
    });

    it("should throw error an exception if product doesn't exists", function (done) {
      const cart = Factory.create("cart");
      spyOnMethod("addToCart", cart.userId);
      function addToCartFunc() {
        return Meteor.call("cart/addToCart", "fakeProductId", variantId, quantity);
      }
      expect(addToCartFunc).to.throw(Meteor.Error, "Product not found [404]");
      return done();
    });
  });

  describe("cart/copyCartToOrder", function () {
    it("should throw error if cart user not current user", function (done) {
      const cart = Factory.create("cart");
      spyOnMethod("copyCartToOrder", "wrongUserId");
      function copyCartFunc() {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      }
      expect(copyCartFunc).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });

    it("should throw error if cart has no items", function (done) {
      const user1 = Factory.create("user");
      sandbox.stub(Reaction, "getShopId", function () {
        return shop._id;
      });

      sandbox.stub(Accounts, "findOne", function () {
        return {
          emails: [{
            address: "test@localhost",
            provides: "default"
          }]
        };
      });
      spyOnMethod("copyCartToOrder", user1._id);
      const cartId = Meteor.call("cart/createCart", user1._id, sessionId);
      function copyCartFunc() {
        return Meteor.call("cart/copyCartToOrder", cartId);
      }
      expect(copyCartFunc).to.throw(Meteor.Error, /Missing cart items/);
      return done();
    });

    it("should throw an error if order creation has failed", function (done) {
      const cart = Factory.create("cartToOrder");
      spyOnMethod("copyCartToOrder", cart.userId);
      // The main moment of test. We are spy on `insert` operation but do not
      // let it through this call
      let insertStub = sandbox.stub(Reaction.Collections.Orders, "insert");
      function copyCartFunc() {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      }
      expect(copyCartFunc).to.throw(Meteor.Error, /Invalid request/);
      expect(insertStub).to.have.been.called;
      return done();
    });

    it("should create an order", function (done) {
      let cart = Factory.create("cartToOrder");
      sandbox.stub(Reaction, "getShopId", function () {
        return cart.shopId;
      });
      spyOnMethod("copyCartToOrder", cart.userId);
      // let's keep it simple. We don't want to see a long email about
      // success. But I leave it here in case if anyone want to check whole
      // method flow.
      let insertStub = sandbox.stub(Reaction.Collections.Orders, "insert");
      function copyCartFunc() {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      }

      expect(copyCartFunc).to.throw(Meteor.Error, /Invalid request/);
      expect(insertStub).to.have.been.called;
      return done();
    });
  });

  describe("cart/unsetAddresses", function () {
    it("should correctly remove addresses from cart", function (done) {
      let cart = Factory.create("cart");
      spyOnMethod("setShipmentAddress", cart.userId);
      spyOnMethod("setPaymentAddress", cart.userId);

      const cartId = cart._id;
      const address = Object.assign({}, getAddress(), {
        _id: Random.id(),
        isShippingDefault: true,
        isBillingDefault: true
      });

      Meteor.call("cart/setPaymentAddress", cartId, address);
      Meteor.call("cart/setShipmentAddress", cartId, address);
      cart = Cart.findOne(cartId);
      expect(cart).not.to.be.undefined;
      expect(cart.shipping[0].address._id).to.equal(address._id);
      expect(cart.billing[0].address._id).to.equal(address._id);

      // our Method checking
      Meteor.call("cart/unsetAddresses", address._id, cart.userId);

      cart = Cart.findOne(cartId);
      expect(cart).to.not.be.undefined;
      expect(cart.shipping[0].address).to.be.undefined;
      expect(cart.billing[0].address).to.be.undefined;
      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      let accountUpdateStub = sandbox.stub(Accounts, "update");

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
      }).to.not.throw;

      expect(accountUpdateStub).to.not.have.been.called;
      accountUpdateStub.restore();
      return done();
    });

    it("should update cart via `type` argument", function (done) {
      let cart = Factory.create("cart");
      spyOnMethod("setShipmentAddress", cart.userId);
      spyOnMethod("setPaymentAddress", cart.userId);

      const cartId = cart._id;
      const address = Object.assign({}, getAddress(), {
        _id: Random.id(),
        isShippingDefault: true,
        isBillingDefault: true
      });
      Meteor.call("cart/setPaymentAddress", cartId, address);
      Meteor.call("cart/setShipmentAddress", cartId, address);
      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address._id).to.equal(address._id);
      expect(cart.billing[0].address._id).to.equal(address._id);

      Meteor.call("cart/unsetAddresses", address._id, cart.userId, "billing");
      Meteor.call("cart/unsetAddresses", address._id, cart.userId, "shipping");

      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address).to.be.undefined;
      expect(cart.billing[0].address).to.be.undefined;
      return done();
    });
  });
});
