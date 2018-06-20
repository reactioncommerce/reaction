/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
/* eslint promise/no-callback-in-promise:0 */
import Random from "@reactioncommerce/random";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import { Roles } from "meteor/alanning:roles";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { createActiveShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import publishProductsToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductsToCatalog";
import publishProductToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductToCatalog";
import collections from "/imports/collections/rawCollections";

Fixtures();

describe("Publication", function () {
  let shopId;
  let merchantShopId;
  let primaryShopId;
  let inactiveMerchantShopId;
  let sandbox;

  let merchantShop1ProductIds;
  let merchantShop1VisibleProductIds;
  let activeShopProductIds;
  let activeShopVisibleProductIds;
  let activeMerchantProductIds;

  const productScrollLimit = 24;

  beforeEach(function () {
    shopId = Random.id();
    merchantShopId = Random.id();
    primaryShopId = Random.id();
    inactiveMerchantShopId = Random.id();

    sandbox = sinon.sandbox.create();
    sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShopId);

    Collections.Shops.remove({});

    // muting some shop creation hook behavior (to keep output clean)
    sandbox.stub(Reaction, "setShopName");
    sandbox.stub(Reaction, "setDomain");

    createActiveShop({ _id: shopId, shopType: "merchant" });
    createActiveShop({ _id: merchantShopId, shopType: "merchant" });
    createActiveShop({ _id: primaryShopId, shopType: "primary" });
    Factory.create("shop", { _id: inactiveMerchantShopId, shopType: "merchant" });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("with products", function () {
    let collector;

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
      this.timeout(15000);
      Collections.Products.remove({});

      // a product with price range A, and not visible
      const productId1 = Collections.Products.insert({
        ancestors: [],
        title: "My Little Pony",
        handle: "my-little-pony",
        shopId,
        type: "simple",
        price: priceRangeA,
        isVisible: false,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product with price range B, and visible
      const productId2 = Collections.Products.insert({
        ancestors: [],
        title: "Shopkins - Peachy",
        handle: "shopkins-peachy",
        shopId,
        price: priceRangeB,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product with price range A, and visible
      const productId3 = Collections.Products.insert({
        ancestors: [],
        title: "Fresh Tomatoes",
        handle: "fresh-tomatoes",
        shopId,
        price: priceRangeA,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product for an unrelated marketplace shop
      const productId4 = Collections.Products.insert({
        ancestors: [],
        title: "Teddy Ruxpin",
        handle: "teddy-ruxpin",
        shopId: merchantShopId,
        type: "simple",
        price: priceRangeA,
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product for the Primary Shop
      const productId5 = Collections.Products.insert({
        ancestors: [],
        title: "Garbage Pail Kids",
        handle: "garbage-pail-kids",
        shopId: primaryShopId,
        type: "simple",
        price: priceRangeA,
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      // a product for an inactive Merchant Shop
      // this product is here to guard against false-positive test results
      Collections.Products.insert({
        ancestors: [],
        title: "Lite Bright",
        handle: "lite-bright",
        shopId: inactiveMerchantShopId,
        type: "simple",
        price: priceRangeA,
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });

      // helper arrays for writing expectations in tests
      merchantShop1ProductIds = [productId1, productId2, productId3];
      merchantShop1VisibleProductIds = [productId2, productId3];
      activeShopProductIds = [productId1, productId2, productId3, productId4, productId5];
      activeShopVisibleProductIds = [productId2, productId3, productId4, productId5];
      activeMerchantProductIds = [productId2, productId3, productId4];

      collector = new PublicationCollector({ userId: Random.id() });
    });

    describe("Products", function () {
      it("should return all products from active shops to admins in the Primary Shop", function (done) {
        // setup
        sandbox.stub(Reaction, "getShopId", () => primaryShopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId, merchantShopId, primaryShopId]);

        collector.collect("Products", 24, undefined, {}, true, ({ Products }) => {
          const productIds = Products.map((product) => product._id);

          expect(productIds).to.have.members(activeShopProductIds);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return all products from the current shop to admins in a Merchant Shop", function (done) {
        // setup
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId, merchantShopId, primaryShopId]);

        collector.collect("Products", 24, undefined, {}, true, ({ Products }) => {
          const productIds = Products.map((product) => product._id);

          expect(productIds).to.have.members(merchantShop1ProductIds);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("returns products from only the shops for which an admin has createProduct Role", function (done) {
        // setup
        sandbox.stub(Reaction, "getShopId", () => primaryShopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);
        sandbox.stub(Reaction, "getShopsWithRoles", () => [shopId]);

        collector.collect("Products", 24, undefined, {}, true, ({ Products }) => {
          const productIds = Products.map((product) => product._id);

          expect(productIds).to.have.members(merchantShop1ProductIds);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return only visible products to visitors", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", 24, undefined, {}, ({ Products }) => {
          const data = Products[0];
          const expectedTitles = ["Fresh Tomatoes", "Shopkins - Peachy"];

          expect(Products.length).to.equal(2);
          expect(expectedTitles.some((title) => title === data.title)).to.be.ok;
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return only products matching query", function (done) {
        const filters = { query: "Shopkins" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          const data = Products[0];

          expect(data.title).to.equal("Shopkins - Peachy");
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should not return products not matching query", function (done) {
        const filters = { query: "random search" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          expect(Products.length).to.equal(0);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return products in price.min query", function (done) {
        const filters = { "price.min": "2.00" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          expect(Products.length).to.equal(1);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return products in price.max query", function (done) {
        const filters = { "price.max": "24.00" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          expect(Products.length).to.equal(2);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return products in price.min - price.max range query", function (done) {
        const filters = { "price.min": "12.00", "price.max": "19.98" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          expect(Products.length).to.equal(2);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return products where value is in price set query", function (done) {
        const filters = { "price.min": "13.00", "price.max": "24.00" };

        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          expect(Products.length).to.equal(1);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return products from all shops when multiple shops are provided", function (done) {
        const filters = { shops: [shopId, merchantShopId] };

        sandbox.stub(Reaction, "getShopId", () => primaryShopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Products", productScrollLimit, filters, {}, ({ Products }) => {
          const productIds = Products.map((product) => product._id);

          expect(productIds).to.have.members(activeMerchantProductIds);
        }).then(() => done(/* empty */)).catch(done);
      });
    });

    describe("Products/grid", function () {
      beforeEach(function () {
        Collections.Catalog.remove({});
      });

      describe("Catalog conditions", function () {
        it("returns nothing when the Catalog is empty", function (done) {
          sandbox.stub(Reaction, "getShopId", () => shopId);

          collector.collect("Products/grid", ({ Catalog }) => {
            const productIds = Catalog.map((product) => product._id);

            expect(productIds).to.be.empty;
          }).then(() => done(/* empty */)).catch(done);
        });

        it("returns products from the Catalog", function (done) {
          sandbox.stub(Reaction, "getShopId", () => shopId);

          publishProducts();

          collector.collect("Products/grid", ({ Catalog }) => {
            const productIds = Catalog.map((product) => product._id);

            expect(productIds).to.not.be.empty;
          }).then(() => done(/* empty */)).catch(done);
        });
      });

      describe("Shop conditions", function () {
        beforeEach(function () {
          return publishProducts();
        });

        it("returns products from the active shop", function (done) {
          sandbox.stub(Reaction, "getShopId", () => shopId);

          collector.collect("Products/grid", ({ Catalog }) => {
            const productIds = Catalog.map((item) => item.product._id);

            expect(productIds).to.have.members(merchantShop1VisibleProductIds);
          }).then(() => done(/* empty */)).catch(done);
        });

        it("returns all visible products from all active shops when the Primary Shop is active", function (done) {
          sandbox.stub(Reaction, "getShopId", () => primaryShopId);

          collector.collect("Products/grid", ({ Catalog }) => {
            const productIds = Catalog.map((item) => item.product._id);

            expect(productIds).to.have.members(activeShopVisibleProductIds);
          }).then(() => done(/* empty */)).catch(done);
        });

        it("returns products from all shops when the Primary Shop is active, filtered by shop id", function (done) {
          const filters = { shopIdsOrSlugs: [shopId, merchantShopId] };

          sandbox.stub(Reaction, "getShopId", () => primaryShopId);

          collector.collect("Products/grid", 24, filters, ({ Catalog }) => {
            const productIds = Catalog.map((item) => item.product._id);

            expect(productIds).to.have.members(activeMerchantProductIds);
          }).then(() => done(/* empty */)).catch(done);
        });
      });

      /**
       * @summary Publishes all products in the database
       * @returns {Promise<Boolean>} true on successful publish for all documents, false if one ore more fail to publish
       */
      function publishProducts() {
        const productIds = Collections.Products.find({}).fetch().map((product) => product._id);

        return Promise.await(publishProductsToCatalog(productIds, collections));
      }
    });

    describe("Product", function () {
      it("should return a product based on an id", function (done) {
        this.timeout(25000);
        const product = Collections.Products.findOne({
          isVisible: true
        });
        Promise.await(publishProductToCatalog(product, collections));

        sandbox.stub(Reaction, "getShopId", () => shopId);

        collector.collect("Product", product._id, ({ Products }) => {
          const data = Products[0];

          expect(data.title).to.equal(product.title);
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should not return a product if handle does not match exactly", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);

        collector.collect("Product", "shopkins", ({ Products }) => {
          if (Products) {
            expect(Products.length).to.equal(0);
          } else {
            expect(Products).to.be.undefined;
          }
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should not return a product based on exact handle match if it isn't visible", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        collector.collect("Product", "my-little-pony", ({ Products }) => {
          if (Products) {
            expect(Products.length).to.equal(0);
          } else {
            expect(Products).to.be.undefined;
          }
        }).then(() => done(/* empty */)).catch(done);
      });

      it("should return a product to admin based on a exact handle match even if it isn't visible", function (done) {
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => true);
        sandbox.stub(Reaction, "hasPermission", () => true);

        collector.collect("Product", "my-little-pony", ({ Products }) => {
          const data = Products[0];

          expect(data.title).to.equal("My Little Pony");
        }).then(() => done(/* empty */)).catch(done);
      });
    });
  });
});
