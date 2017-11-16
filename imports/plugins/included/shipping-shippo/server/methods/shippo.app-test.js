/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Cart } from "/lib/collections";
// import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getCartItem } from "/server/imports/fixtures/cart";
import Fixtures from "/server/imports/fixtures";

Fixtures();

const shippoDocs = {};
const retrialTargets = [];

describe("Shippo methods", function () {
  let sandbox;
  let originals;

  before(function () {
    originals = {
      addToCart: Meteor.server.method_handlers["cart/addToCart"],
      getShippingRatesForCart: Meteor.server.method_handlers["shippo/getShippingRatesForCart"]
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
      check(arguments, [Match.Any]);
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  function spyOnShippo(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `shippo/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  describe("shippo/getShippingRatesForCart", function () {
    const quantity = 1;
    let permissionStub;
    let resetShipmentStub;
    let updateShipmentQuoteStub;

    before(function () {
      permissionStub = sinon.stub(Reaction, "hasPermission", function () {
        return true;
      });

      resetShipmentStub = sinon.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function () {
        check(arguments, [Match.Any]);
        return true;
      });
      updateShipmentQuoteStub = sinon.stub(Meteor.server.method_handlers, "shipping/updateShipmentQuotes", function () {
        check(arguments, [Match.Any]);
        return true;
      });
    });

    after(function () {
      permissionStub.restore();
      resetShipmentStub.restore();
      updateShipmentQuoteStub.restore();
    });

    beforeEach(function () {
      Cart.remove({});
    });

    it("should add item to cart", function (done) {
      let cart = Factory.create("cart");
      const cartId = cart._id;
      const { productId, variants } = getCartItem();
      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", productId, variants._id, quantity);
      Meteor._sleepForMs(1000);
      cart = Cart.findOne(cartId);
      spyOnShippo("getShippingRatesForCart", cart.userId);
      Meteor.call("shippo/getShippingRatesForCart", cartId, shippoDocs, retrialTargets);
      done();
    });
  });
});
