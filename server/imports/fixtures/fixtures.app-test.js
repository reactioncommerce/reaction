/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { addProductSingleVariant } from "/server/imports/fixtures/products";
import { createCart } from "/server/imports/fixtures/cart";

Fixtures();

describe("Fixtures:", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Orders.remove();
  });

  afterEach(function () {
    sandbox.restore();
    Collections.Orders.remove();
  });

  it("Account fixture should create an account", function () {
    const account = Factory.create("account");
    expect(account).to.not.be.undefined;
    const accountCount = Collections.Accounts.find().count();
    expect(accountCount).to.be.above(0);
  });

  it("Cart fixture should create a cart", function () {
    const cart = Factory.create("cart");
    expect(cart).to.not.be.undefined;
    const cartCount = Collections.Cart.find().count();
    expect(cartCount).to.be.above(0);
  });

  it("CartOne fixture should create a cart with one item with a quantity of one", function () {
    const cartOne = Factory.create("cartOne");
    expect(cartOne).to.not.be.undefined;
    const createdCart = Collections.Cart.findOne(cartOne._id);
    expect(createdCart).to.not.be.undefined;
    expect(createdCart.items.length).to.equal(1);
    expect(createdCart.items[0].quantity).to.equal(1);
  });

  it("CartTwo fixture should create a cart with one item with a quantity of two", function () {
    const cartOne = Factory.create("cartTwo");
    expect(cartOne).to.not.be.undefined;
    const createdCart = Collections.Cart.findOne(cartOne._id);
    expect(createdCart).to.not.be.undefined;
    expect(createdCart.items.length).to.equal(1);
    expect(createdCart.items[0].quantity).to.equal(2);
  });

  it("createCart function should create a cart with a specific product", function () {
    const { product, variant } = addProductSingleVariant();
    const cart = createCart(product._id, variant._id);
    expect(cart).to.not.be.undefined;
    const createdCart = Collections.Cart.findOne(cart._id);
    expect(createdCart).to.not.be.undefined;
    expect(createdCart.items.length).to.equal(1);
  });

  it("Order fixture should create an order", function () {
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Meteor.server.method_handlers, "inventory/register", function (...args) {
      check(args, [Match.Any]);
    });
    sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function (...args) {
      check(args, [Match.Any]);
    });
    const order = Factory.create("order");
    expect(order).to.not.be.undefined;
    const orderCount = Collections.Orders.find().count();
    expect(orderCount).to.be.above(0);
  });

  it("Shop fixture should create a Shop", function () {
    const shop = Factory.create("shop");
    expect(shop).to.not.be.undefined;
    const shopCount = Collections.Shops.find().count();
    expect(shopCount).to.be.above(1);
  });

  it("Product fixture should create a product", function () {
    const product = Factory.create("product");
    expect(product).to.not.be.undefined;
    const productCount = Collections.Products.find().count();
    expect(productCount).to.be.above(0);
  });
});
