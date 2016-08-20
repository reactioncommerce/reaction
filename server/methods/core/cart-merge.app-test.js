/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Merge Cart function ", function () {
  const shop = getShop();
  const sessionId = Reaction.sessionId = Random.id();
  let originals;
  let sandbox;
  let pushCartWorkflowStub;
  let cartHookStub;
  let productHookStub;

  before(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    if (Array.isArray(Collections.Products._hookAspects.remove.after) &&
      Collections.Products._hookAspects.remove.after.length) {
      cartHookStub = sinon.stub(Collections.Cart._hookAspects.update.after[0], "aspect");
      productHookStub = sinon.stub(Collections.Products._hookAspects.remove.after[0], "aspect");
    }
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"],
      setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
      setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
    };

    Collections.Products.remove({});

    // mock it. If you want to make full integration test, comment this out
    pushCartWorkflowStub = sinon.stub(Meteor.server.method_handlers, "workflow/pushCartWorkflow", function () {
      check(arguments, [Match.Any]);
      return true;
    });
  });

  after(function () {
    pushCartWorkflowStub.restore();
    cartHookStub.restore();
    productHookStub.restore();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Cart.remove({});
  });

  afterEach(function () {
    sandbox.restore();
    Meteor.users.remove({});
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  it("should merge all anonymous carts into existent `normal` user cart per session, when logged in", function () {
    sandbox.stub(Reaction, "getShopId", () => shop._id);
    let anonymousCart = Factory.create("anonymousCart");
    let cart = Factory.create("cart");
    let cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(2);
    spyOnMethod("mergeCart", cart.userId);
    const cartRemoveSpy = sandbox.spy(Collections.Cart, "remove");
    Collections.Cart.update({}, {
      $set: {
        sessionId: sessionId
      }
    });
    const mergeResult = Meteor.call("cart/mergeCart", cart._id, sessionId);
    expect(mergeResult).to.be.ok;
    anonymousCart = Collections.Cart.findOne(anonymousCart._id);
    cart = Collections.Cart.findOne(cart._id);
    cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(1);
    expect(cartRemoveSpy).to.have.been.called;
    expect(anonymousCart).to.be.undefined;
    expect(cart.items.length).to.equal(2);
  });

  it("should merge only into registered user cart", function (done) {
    sandbox.stub(Reaction, "getShopId", function () {
      return shop._id;
    });
    const cart = Factory.create("anonymousCart");
    spyOnMethod("mergeCart", cart.userId);
    const cartId = cart._id;
    // now we try to merge two anonymous carts. We expect to see `false`
    // result
    expect(Meteor.call("cart/mergeCart", cartId)).to.be.false;
    return done();
  });

  it("should throw an error if cart doesn't exist", function (done) {
    spyOnMethod("mergeCart", "someIdHere");
    function mergeCartFunction() {
      Meteor.call("cart/mergeCart", "non-existent-id", sessionId);
    }
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    return done();
  });

  it("should throw an error if cart user is not current user", function (done) {
    const cart = Factory.create("cart");
    spyOnMethod("mergeCart", "someIdHere");
    function mergeCartFunction() {
      return Meteor.call("cart/mergeCart", cart._id, "someSessionId");
    }
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    return done();
  });
});
