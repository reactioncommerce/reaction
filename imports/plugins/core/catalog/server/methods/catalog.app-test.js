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
import { publishProductToCatalog } from "./catalog";

Fixtures();

describe("Catalog", function () {
  const shopId = Random.id();
  let sandbox;

  beforeEach(function () {
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

    beforeEach(function (done) {
      Collections.Products.remove({});
      Collections.Catalog.remove({});

      // a product with price range A, and not visible
      const id1 = Collections.Products.insert({
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
      const id2 = Collections.Products.insert({
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
      const id3 = Collections.Products.insert({
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

      Promise.all([
        publishProductToCatalog(id1),
        publishProductToCatalog(id2),
        publishProductToCatalog(id3)
      ]).then(() => {
        done();
      });
    });

    describe("Collection", function () {
      it("should return 3 products from the Catalog", function () {
        const products = Collections.Catalog.find({}).fetch();
        expect(products.length).to.equal(3);
      });
    });

    describe("Publication", function () {
      it("should return 2 products from Products/get", function (done) {
        const productScrollLimit = 24;
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products/grid", productScrollLimit, undefined, {}, (collections) => {
          const products = collections.Catalog;
          expect(products.length).to.equal(2);

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });

      it("should return one product in price.min query", function (done) {
        const productScrollLimit = 24;
        const filters = { "price.min": "2.00" };
        sandbox.stub(Reaction, "getShopId", () => shopId);
        sandbox.stub(Roles, "userIsInRole", () => false);

        const collector = new PublicationCollector({ userId: Random.id() });
        let isDone = false;

        collector.collect("Products/grid", productScrollLimit, filters, {}, (collections) => {
          const products = collections.Catalog;
          expect(products.length).to.equal(1);

          if (!isDone) {
            isDone = true;
            done();
          }
        });
      });
    });
  });
});
