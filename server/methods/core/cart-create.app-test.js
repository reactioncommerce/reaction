/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Cart, Products, Accounts } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import { addProduct } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";

Fixtures();


describe("cart methods", function () {
  let user = Factory.create("user");
  const shop = getShop();
  let userId = user._id;
  const sessionId = Reaction.sessionId = Random.id();
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

  after(() => {
    Meteor.users.remove({});
  });

  afterEach(function () {
    Meteor.users.remove({});
    spies.restoreAll();
    stubs.restoreAll();
  });

  beforeEach(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  function spyOnMethod(method, id) {
    return sinon.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      stubs.create("shopIdAutoValue");
      stubs.shopIdAutoValue.returns(shop._id);
      // spyOn(Reaction, "shopIdAutoValue").and.returnValue(shop._id);
      stubs.create("getShopIdStub", Reaction, "getShopId");
      stubs.getShopIdStub.returns(shop._id);
      // spyOn(Reaction, "getShopId").and.returnValue(shop._id);
      let createSpy = spyOnMethod("createCart", userId);
      spies.create("cartInsertSpy", Cart, "insert");
      // spyOn(Reaction.Collections.Cart, "insert").and.callThrough();
      let cartId = Meteor.call("cart/createCart", userId, sessionId);
      let cart = Cart.findOne({
        userId: userId
      });
      expect(spies.cartInsertSpy).to.have.been.called;
      expect(cartId).to.equal(cart._id);
      createSpy.restore();
      done();
    });
  });

  describe("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    before(function () {

      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(true);
      // Stub out non-cart-related methods that are called by the cart methods
      stubs.create("resetShippingStub", Meteor.server.method_handlers, "cart/resetShipmentMethod");
      stubs.resetShippingStub.returns(true);
      stubs.create("resetQuoteStub", Meteor.server.method_handlers, "shipping/updateShipmentQuotes");
      product = addProduct();
      productId = product._id;
      variantId = Products.findOne({
        ancestors: [productId]
      })._id;
    });

    // it("should add item to cart", function (done) {
    //   let cart = Factory.create("cart");
    //   let items = cart.items.length;
    //   let addCartSpy = spyOnMethod("addToCart", cart.userId);
    //   Meteor.call("cart/addToCart", productId, variantId, quantity);
    //   Meteor._sleepForMs(500);
    //   cart = Cart.findOne(cart._id);
    //   expect(cart.items.length).to.equal(items + 1);
    //   expect(cart.items[cart.items.length - 1].productId).to.equal(productId);
    //   addCartSpy.restore();
    //   done();
    // });
    //
    // it("should merge all items of same variant in cart", function (done) {
    //   let cart = Factory.create("cart");
    //   stubs.create("shopIdAutoValueStub", shopIdAutoValue, "call");
    //   stubs.shopIdAutoValueStub.returns(shop._id);
    //   stubs.create("getShopIdStub", Reaction, "getShopId");
    //   stubs.getShopIdStub.returns(shop._id);
    //   // spyOn(Reaction, "getShopId").and.returnValue(shop._id);
    //   let addCartSpy = spyOnMethod("addToCart", cart.userId);
    //   // const cartId = Meteor.call("cart/createCart", userId, sessionId);
    //   let cartItem = cart.items[0];
    //   let cartProduct = cartItem.productId;
    //   let cartVariant = cartItem.variants._id;
    //   console.log(cartProduct);
    //   console.log(cartVariant);
    //   Meteor.call("cart/addToCart", cartProduct, cartVariant, quantity);
    //   Meteor._sleepForMs(500);
    //   // add a second item of same variant
    //   Meteor.call("cart/addToCart", cartProduct, cartVariant, quantity);
    //   Meteor._sleepForMs(500);
    //   let cartFromDb = Cart.findOne(cart._id);
    //   console.log(cartFromDb);
    //   assert(cartFromDb.items.length === 1);
    //   assert(cartFromDb.items[0].quantity === 2, "There should be two of this item");
    //   addCartSpy.restore();
    //   return done();
    // });

    it("should throw error an exception if user doesn't have a cart", function (done) {
      const userWithoutCart = Factory.create("user");
      let addCartSpy = spyOnMethod("addToCart", userWithoutCart._id);
      let addToCartFunc = function () {
        return Meteor.call("cart/addToCart", productId, variantId, quantity);
      };
      expect(addToCartFunc).to.throw(Meteor.Error, /Cart not found/);
      addCartSpy.restore();
      return done();
    });

    it("should throw error an exception if product doesn't exists", function (done) {
      const cart = Factory.create("cart");
      let addCartSpy = spyOnMethod("addToCart", cart.userId);
      let addToCartFunc = function () {
        return Meteor.call("cart/addToCart", "fakeProductId", variantId, quantity);
      };
      expect(addToCartFunc).to.throw(Meteor.Error, "Product not found [404]");
      addCartSpy.restore();
      return done();
    });
  });

  describe("cart/copyCartToOrder", function () {
    it("should throw error if cart user not current user", function (done) {
      const cart = Factory.create("cart");
     let copyCartSpy =  spyOnMethod("copyCartToOrder", "wrongUserId");
      let copyCartFunc = function () {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      };
      expect(copyCartFunc).to.throw(Meteor.Error, /Access Denied/);
      copyCartSpy.restore();
      return done();
    });

    it("should throw error if cart has no items", function (done) {
      const user1 = Factory.create("user");
      let getShopStub = sinon.stub(Reaction, "getShopId", function () {
        return shop._id;
      });

      let findAccountStub = sinon.stub(Accounts, "findOne", function () {
        return {
          emails: [{
            address: "test@localhost",
            provides: "default"
          }]
        };
      });
      let copyCartStub = spyOnMethod("copyCartToOrder", user1._id);
      const cartId = Meteor.call("cart/createCart", user1._id, sessionId);
      let copyCartFunc = function () {
        return Meteor.call("cart/copyCartToOrder", cartId);
      };
      expect(copyCartFunc).to.throw(Meteor.Error, /Missing cart items/);

      getShopStub.restore();
      findAccountStub.restore();
      copyCartStub.restore();
      return done();
    });

    it("should throw an error if order creation has failed", function (done) {
      const cart = Factory.create("cartToOrder");
      let copyCartSpy = spyOnMethod("copyCartToOrder", cart.userId);
      // The main moment of test. We are spy on `insert` operation but do not
      // let it through this call
      let insertStub = sinon.stub(Reaction.Collections.Orders, "insert");
      let copyCartFunc = function () {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      };
      expect(copyCartFunc).to.throw(Meteor.Error, /Invalid request/);
      expect(insertStub).to.have.been.called;
      copyCartSpy.restore();
      insertStub.restore();
      return done();
    });

    it("should create an order", function (done) {
      let cart = Factory.create("cartToOrder");
      let getShopIdStub = sinon.stub(Reaction, "getShopId", function () {
        return cart.shopId;
      });
      let copyCartStub = spyOnMethod("copyCartToOrder", cart.userId);
      // let's keep it simple. We don't want to see a long email about
      // success. But I leave it here in case if anyone want to check whole
      // method flow.
      let insertStub = sinon.stub(Reaction.Collections.Orders, "insert");
      let copyCartFunc = function () {
        return Meteor.call("cart/copyCartToOrder", cart._id);
      };

      expect(copyCartFunc).to.throw(Meteor.Error, /Invalid request/);
      expect(insertStub).to.have.been.called;
      getShopIdStub.restore();
      insertStub.restore();
      copyCartStub.restore();
      return done();
    });
  });

  describe("cart/unsetAddresses", function () {
    it("should correctly remove addresses from cart", function (done) {
      let cart = Factory.create("cart");
      let setShipmentAddressStub = spyOnMethod("setShipmentAddress", cart.userId);
      let setPaymentAddressStub = spyOnMethod("setPaymentAddress", cart.userId);

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

      // our Method checking
      Meteor.call("cart/unsetAddresses", address._id, cart.userId);

      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address).to.be.undefined;
      expect(cart.billing[0].address).to.be.undefined;
      setShipmentAddressStub.restore();
      setPaymentAddressStub.restore();
      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      let accountUpdateStub = sinon.stub(Accounts, "update");

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
      let setShipmentAddressStub = spyOnMethod("setShipmentAddress", cart.userId);
      let setPaymentAddressStub = spyOnMethod("setPaymentAddress", cart.userId);

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

      Meteor.call("cart/unsetAddresses", address._id, cart.userId,
        "billing");
      Meteor.call("cart/unsetAddresses", address._id, cart.userId,
        "shipping");

      cart = Cart.findOne(cartId);

      expect(cart.shipping[0].address).to.be.undefined;
      expect(cart.billing[0].address).to.be.undefined;
      setShipmentAddressStub.restore();
      setPaymentAddressStub.restore();
      return done();
    });
  });
});
