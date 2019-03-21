/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import ReactionError from "@reactioncommerce/reaction-error";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Cart, Products } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import { addProduct } from "/imports/plugins/core/core/server/fixtures/products";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

Fixtures();

describe("Add/Create cart methods", function () {
  const user = Factory.create("user");
  const account = Factory.create("account", { userId: user._id });
  const shop = getShop();
  const accountId = account._id;
  const userId = user._id;
  let sandbox;
  let originals;

  before(function () {
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      createCart: Meteor.server.method_handlers["cart/createCart"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"]
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
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, args);
    });
  }

  describe("cart/createCart", function () {
    it("should create a test cart", function () {
      sandbox.stub(Reaction, "getPrimaryShopId", () => shop._id);
      const cartInsertSpy = sandbox.spy(Cart, "insert");
      const cartId = Meteor.call("cart/createCart");
      const cart = Cart.findOne({ accountId });
      expect(cartInsertSpy).to.have.been.called;
      expect(cartId).to.equal(cart._id);
    });
  });

  describe("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;
    let permissionStub;

    before(function () {
      permissionStub = sinon.stub(Reaction, "hasPermission", function () {
        return true;
      });

      product = addProduct();
      productId = product._id;
      variantId = Products.findOne({
        ancestors: [productId]
      })._id;
    });

    after(function () {
      permissionStub.restore();
    });

    beforeEach(function () {
      Cart.remove({});
    });

    it("should add item to cart", function (done) {
      let cart = Factory.create("cart", { accountId });
      const items = cart.items.length;
      spyOnMethod("addToCart", userId);
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      cart = Cart.findOne({ _id: cart._id });
      expect(cart.items.length).to.equal(items + 1);
      expect(cart.items[cart.items.length - 1].productId).to.equal(productId);
      done();
    });

    it("should merge all items of same variant in cart", function () {
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      spyOnMethod("addToCart", userId);
      const cartId = Meteor.call("cart/createCart");

      Meteor.call("cart/addToCart", productId, variantId, quantity);
      // add a second item of same variant
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      const cart = Cart.findOne({ _id: cartId });
      expect(cart.items.length).to.equal(1);
      expect(cart.items[0].quantity).to.equal(2);
    });

    it("should throw error an exception if user doesn't have a cart", function (done) {
      const userWithoutCart = Factory.create("user");
      spyOnMethod("addToCart", userWithoutCart._id);
      function addToCartFunc() {
        return Meteor.call("cart/addToCart", productId, variantId, quantity);
      }
      expect(addToCartFunc).to.throw(ReactionError, /Cart not found/);
      return done();
    });

    it("should throw error an exception if product doesn't exists", function (done) {
      spyOnMethod("addToCart", userId);
      function addToCartFunc() {
        return Meteor.call("cart/addToCart", "fakeProductId", variantId, quantity);
      }
      expect(addToCartFunc).to.throw(ReactionError, "Product with such id was not found [not-found]");
      return done();
    });
  });
});
