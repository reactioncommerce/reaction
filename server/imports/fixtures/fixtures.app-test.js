import { Meteor } from "meteor/meteor";

import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";

import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Fixtures:", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Orders.direct.remove();
  });

  afterEach(function () {
    sandbox.restore();
    Collections.Orders.direct.remove();
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

  it("Order fixture should create an order", function () {
    // Order has analytics hooks on it that need to be turned off
    sandbox.stub(Collections.Orders._hookAspects.insert.before[0], "aspect");
    sandbox.stub(Collections.Orders._hookAspects.update.before[0], "aspect");
    sandbox.stub(Reaction, "hasPermission", () => true);
    sandbox.stub(Meteor.server.method_handlers, "inventory/register", function () {
      check(arguments, [Match.Any]);
    });
    sandbox.stub(Meteor.server.method_handlers, "inventory/sold", function () {
      check(arguments, [Match.Any]);
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
