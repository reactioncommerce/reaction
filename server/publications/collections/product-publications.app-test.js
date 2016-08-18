/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Publication", function () {
  const shop = getShop();
  let sandbox;
  let productRemoveStub;
  let productInsertStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  before(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    // if you want to do a real stress test, you could try to comment out
    // this spyOn lines. This is needed only for ./reaction test. In one
    // package test this is ignoring.
    if (Array.isArray(Collections.Products._hookAspects.remove.after) && Collections.Products._hookAspects.remove.after.length) {
      productRemoveStub = sinon.stub(Collections.Products._hookAspects.remove.after[0], "aspect");
      productInsertStub = sinon.stub(Collections.Products._hookAspects.insert.after[0], "aspect");
    }
    Collections.Products.remove({});
    // really strange to see this, but without this `remove` finishes in
    // async way (somewhere in a middle of testing process)
    Meteor.setTimeout(function () {
      Collections.Orders.remove({});
    }, 500);
  });

  after(function () {
    productRemoveStub.restore();
    productInsertStub.restore();
  });

  describe("with products", function () {
    const thisContext = {
      ready: function () { return "ready"; }
    };
    const priceRangeA = {
      range: "1.00 - 12.99",
      min: 1.00,
      max: 12.99
    };

    const priceRangeB = {
      range: "12.99 - 19.99",
      min: 12.99,
      max: 19.99
    };

    before(function () {
      // a product with price range A, and not visible
      Collections.Products.insert({
        ancestors: [],
        title: "My Little Pony",
        shopId: shop._id,
        type: "simple",
        price: priceRangeA,
        isVisible: false,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product with price range B, and visible
      Collections.Products.insert({
        ancestors: [],
        title: "Shopkins - Peachy",
        shopId: shop._id,
        price: priceRangeB,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product with price range A, and visible
      Collections.Products.insert({
        ancestors: [],
        title: "Fresh Tomatoes",
        shopId: shop._id,
        price: priceRangeA,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
    });

    describe("Products", function () {
      it("should return all products to admins", function () {
        // setup
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => true);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub();
        // verify
        expect(cursor.fetch().length).to.equal(3);
        // check product data
        const data = cursor.fetch()[1];
        expect(["My Little Pony", "Shopkins - Peachy"].
        some(title => title === data.title)).to.be.ok;
      });

      it("should return only visible products to visitors", function () {
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub();
        const data = cursor.fetch()[0];
        expect(cursor.fetch().length).to.equal(2);
        // check first product result
        expect(["Fresh Tomatoes", "Shopkins - Peachy"].
        some(title => title === data.title)).to.be.ok;
      });

      it("should return only products matching query", function () {
        const productScrollLimit = 24;
        const filters = {query: "Shopkins"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        const data = cursor.fetch()[0];
        expect(data.title).to.equal("Shopkins - Peachy");
      });

      it("should not return products not matching query", function () {
        const productScrollLimit = 24;
        const filters = {query: "random search"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        // verify
        expect(cursor.fetch().length).to.equal(0);
      });

      it("should return products in price.min query", function () {
        const productScrollLimit = 24;
        const filters = {"price.min": "2.00"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        // verify
        expect(cursor.fetch().length).to.equal(1);
      });

      it("should return products in price.max query", function () {
        const productScrollLimit = 24;
        const filters = {"price.max": "24.00"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        // verify
        expect(cursor.fetch().length).to.equal(2);
      });

      it("should return products in price.min - price.max range query", function () {
        const productScrollLimit = 24;
        const filters = {"price.min": "12.00", "price.max": "19.98"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        // verify
        expect(cursor.fetch().length).to.equal(2);
      });

      it("should return products where value is in price set query", function () {
        const productScrollLimit = 24;
        const filters = {"price.min": "13.00", "price.max": "24.00"};
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productsPub = Meteor.server.publish_handlers["Products"];
        const cursor = productsPub(productScrollLimit, filters);
        expect(cursor.fetch().length).to.equal(1);
      });

      it("should return products from all shops when multiple shops are provided", function () {
        const filters = {shops: [shop._id]};
        const productScrollLimit = 24;
        sandbox.stub(Reaction, "getCurrentShop", function () {return {_id: "123"};});
        sandbox.stub(Roles, "userIsInRole", () => true);
        const cursor = Meteor.server.publish_handlers.Products(productScrollLimit, filters);
        expect(cursor.fetch().length).to.equal(3);
        const data = cursor.fetch()[1];
        expect(["My Little Pony", "Shopkins - Peachy"].some(title => title === data.title)).to.be.ok;
      });
    });

    describe("Product", function () {
      it("should return a product based on an id", function () {
        const product = Collections.Products.findOne({
          isVisible: true
        });
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        const cursor = Meteor.server.publish_handlers.Product(
          product._id);
        const data = cursor.fetch()[0];
        expect(data.title).to.equal(product.title);
      });

      it("should return a product based on a regex", function () {
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        const cursor = Meteor.server.publish_handlers.Product("shopkins");
        const data = cursor.fetch()[0];
        expect(data.title).to.equal("Shopkins - Peachy");
      });

      it("should not return a product based on a regex if it isn't visible", function () {
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => false);
        const productPub = Meteor.server.publish_handlers["Product"];
        const cursor = productPub.apply(thisContext, ["my"]);
        expect(cursor).to.equal("ready");
      });

      it("should return a product based on a regex to admin if it isn't visible", function () {
        sandbox.stub(Reaction, "getCurrentShop", () => shop);
        sandbox.stub(Roles, "userIsInRole", () => true);
        const cursor = Meteor.server.publish_handlers.Product("my");
        const data = cursor.fetch()[0];
        expect(data.title).to.equal("My Little Pony");
      });
    });
  });
});


