/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Random } from "meteor/random";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { createActiveShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

Fixtures();

describe("Publication", function () {
  const shopId = Random.id();
  let sandbox;

  beforeEach(function () {
    Collections.Shops.remove({});
    createActiveShop({ _id: shopId });
    sandbox = sinon.sandbox.create();
    sandbox.stub(RevisionApi, "isRevisionControlEnabled", () => true);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("with products", function () {
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

    beforeEach(function () {
      Collections.Products.remove({});

      // a product with price range A, and not visible
      Collections.Products.insert({
        ancestors: [],
        title: "My Little Pony",
        shopId,
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
        shopId,
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
        shopId,
        price: priceRangeA,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
    });

    describe("Products", function () {
      it("should return all products to admins", function (done) {
        // setup
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId]);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products", 24, undefined, {}, (collections) => {
          const products = collections.Products;
          expect(products.length).to.equal(3);

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });

      it("should have an expected product title", function (done) {
        // setup
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId]);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products", 24, undefined, {}, (collections) => {
          const products = collections.Products;
          const data = products[1];
          const expectedTitles = ["My Little Pony", "Shopkins - Peachy"];

          expect(expectedTitles.some((title) => title === data.title)).to.be.ok;

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });

      it("should return only visible products to visitors", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products", 24, undefined, {}, (collections) => {
          const products = collections.Products;
          const data = products[0];
          const expectedTitles = ["Fresh Tomatoes", "Shopkins - Peachy"];

          expect(products.length).to.equal(2);
          expect(expectedTitles.some((title) => title === data.title)).to.be.ok;

          if (isDone === false) {
            isDone = true;
            done();
          }
        });
      });

      it("should return only products matching query", function (done) {
        const productScrollLimit = 24;
        const filters = { query: "Shopkins" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;
          const data = products[0];

          expect(data.title).to.equal("Shopkins - Peachy");

          done();
        });
      });

      it("should not return products not matching query", function (done) {
        const productScrollLimit = 24;
        const filters = { query: "random search" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;

          expect(products.length).to.equal(0);

          done();
        });
      });

      it("should return products in price.min query", function (done) {
        const productScrollLimit = 24;
        const filters = { "price.min": "2.00" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;

          expect(products.length).to.equal(1);

          done();
        });
      });

      it("should return products in price.max query", function (done) {
        const productScrollLimit = 24;
        const filters = { "price.max": "24.00" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;

          expect(products.length).to.equal(2);

          done();
        });
      });

      it("should return products in price.min - price.max range query", function (done) {
        const productScrollLimit = 24;
        const filters = { "price.min": "12.00", "price.max": "19.98" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;

          expect(products.length).to.equal(2);

          done();
        });
      });

      it("should return products where value is in price set query", function (done) {
        const productScrollLimit = 24;
        const filters = { "price.min": "13.00", "price.max": "24.00" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;

          expect(products.length).to.equal(1);

          done();
        });
      });

      it("should return products from all shops when multiple shops are provided", function (done) {
        const filters = { shops: [shopId] };
        const productScrollLimit = 24;
        sandbox.stub(Reaction, "getCurrentShop", function () { return { _id: "123" }; });
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId]);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Products;
          expect(products.length).to.equal(3);

          const data = products[1];
          expect(["My Little Pony", "Shopkins - Peachy"].some((title) => title === data.title)).to.be.ok;

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });
    });

    describe("Product", function () {
      it("should return a product based on an id", function (done) {
        const product = Collections.Products.findOne({
          isVisible: true
        });
        sandbox.stub(Reaction, "getShopId", () => shopId);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Product", product._id, (collections) => {
          const products = collections.Products;
          const data = products[0];

          expect(data.title).to.equal(product.title);

          done();
        });
      });

      it("should return a product based on a regex", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);

        const collector = new PublicationCollector({ userId: Random.id() });

        collector.collect("Product", "shopkins", (collections) => {
          const products = collections.Products;
          const data = products[0];

          expect(data.title).to.equal("Shopkins - Peachy");

          done();
        });
      });

      it("should not return a product based on a regex if it isn't visible", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Product", "my", (collections) => {
          const products = collections.Products;
          if (products) {
            expect(products.length).to.equal(0);
          } else {
            expect(products).to.be.undefined;
          }


          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });

      it("should return a product based on a regex to admin even if it isn't visible", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Product", "my", (collections) => {
          const products = collections.Products;
          const data = products[0];

          expect(data.title).to.equal("My Little Pony");

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });
    });
  });
});
