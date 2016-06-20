/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Merge Cart function ", function () {
  const shop = getShop();
  const sessionId = Reaction.sessionId = Random.id();
  let originals;

  before(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    if (Array.isArray(Collections.Products._hookAspects.remove.after) &&
      Collections.Products._hookAspects.remove.after.length) {
      stubs.create("cartHookSpy", Collections.Cart._hookAspects.update.after[0], "aspect");
      stubs.create("productHookSpy", Collections.Products._hookAspects.remove.after[0], "aspect");
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
    sinon.stub(Meteor.server.method_handlers, "workflow/pushCartWorkflow", function () {
      check(arguments, [Match.Any]);
      return true;
    });
  });

  afterEach(function () {
    Meteor.users.remove({});
    spies.restoreAll();
    stubs.restoreAll();
  });

  beforeEach(function () {
    Collections.Cart.remove({});
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
  //
  // it("should merge all `anonymous` carts into existent `normal` user cart per session, when logged in",
  //   function (done) {
  //     let anonymousCart = Factory.create("anonymousCart");
  //     let cart = Factory.create("cart");
  //     let mergeSpy = spyOnMethod("mergeCart", cart.userId);
  //     mergeSpy.withArgs(cart.userId, sessionId);
  //     stubs.create("getShopIdStub", Reaction, "getShopId");
  //     stubs.getShopIdStub.returns(shop._id);
  //     let cartRemoveSpy = sinon.spy(Collections.Cart, "remove");
  //     Collections.Cart.update({}, {
  //       $set: {
  //         sessionId: sessionId
  //       }
  //     });
  //
  //     Meteor.call("cart/mergeCart", cart._id, sessionId);
  //     anonymousCart = Collections.Cart.findOne(anonymousCart._id);
  //     cart = Collections.Cart.findOne(cart._id);
  //     expect(cartRemoveSpy).to.have.been.called;
  //     expect(anonymousCart).to.be.undefined;
  //     expect(cart.items.length).to.equal(2);
  //     stubs.getShopIdStub.restore();
  //     cartRemoveSpy.restore();
  //     mergeSpy.restore();
  //     done();
  //   });

  it("should merge only into registered user cart", function (done) {
    const cart = Factory.create("anonymousCart");
    let mergeSpy = spyOnMethod("mergeCart", cart.userId);
    stubs.create("getShopIdStub", Reaction, "getShopId");
    stubs.getShopIdStub.returns(shop._id);
    const cartId = cart._id;
    // now we try to merge two anonymous carts. We expect to see `false`
    // result
    expect(Meteor.call("cart/mergeCart", cartId)).to.be.false;
    mergeSpy.restore();
    return done();
  });

  it("should throw an error if cart doesn't exist", function (done) {
    let mergeSpy = spyOnMethod("mergeCart", "someIdHere");
    let mergeCartFunction = function () {
      Meteor.call("cart/mergeCart", "non-existent-id", sessionId);
    };
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    mergeSpy.restore();
    return done();
  });

  it("should throw an error if cart user is not current user", function (done) {
    let cart = Factory.create("cart");
    let mergeSpy = spyOnMethod("mergeCart", "someIdHere");
    let mergeCartFunction = function () {
      return Meteor.call("cart/mergeCart", cart._id, "someSessionId");
    };
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    mergeSpy.restore();
    return done();
  });
});
