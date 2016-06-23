/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Cart, Products } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
import { addProduct } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe.skip("Monkey-patching methods", function () {
  let user = Factory.create("user");
  let originals;

  before(function () {
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"],
      setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
      setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
    };
  });


  function spyOnMethod(method, id) {
    return sinon.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
    });
  }

  after(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  describe.skip("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    before(function () {
      sinon.stub(Meteor.server.method_handlers, "cart/resetShipmentMethod", function () {
        check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
        return true;
      });

      product = addProduct();
      productId = product._id;
      variantId = Products.findOne({
        ancestors: [productId]
      })._id;
    });


    beforeEach(function () {
      Cart.remove({});
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
  });
});

