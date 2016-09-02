import faker from "faker";
import { expect } from "meteor/practicalmeteor:chai";
import { Reaction } from "/server/api";
import { getSlug } from "/lib/api";
import { Products } from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { getResults } from "./searchresults";
import { buildProductSearch } from "../methods/searchcollections";
import { buildProductSearchRecord } from "../methods/searchcollections";

Fixtures();

export function createProduct(isVisible = true, title) {
  const productTitle = title || faker.commerce.productName();
  const productSlug = getSlug(productTitle);
  const product = {
    ancestors: [],
    shopId: Reaction.getShopId(),
    title: productTitle,
    pageTitle: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    type: "simple",
    vendor: faker.company.companyName(),
    price: {
      range: "24.99",
      min: 24.99,
      max: 24.99
    },
    isLowQuantity: false,
    isSoldOut: false,
    isBackorder: false,
    metafields: [
      {
        key: "Material",
        value: "Canvas"
      },
      {
        key: "Sole",
        value: "Rubber"
      }
    ],
    requiresShipping: true,
    hashtags: [],
    isVisible: isVisible,
    handle: productSlug,
    workflow: {
      status: "new"
    }
  };
  const insertedProduct = Products.insert(product);
  return insertedProduct;
}

describe.only("Search results", function () {
  const shopId = Reaction.getShopId();

  before(function () {
    buildProductSearch();
  });

  describe("product search", function () {
    it("should produce at least one result for title match", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title;
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results which are case insensitive to lowercase", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title.toLowerCase();
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results which are case insensitive to uppercase", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title.toUpperCase();
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce no results for phony title match", function () {
      const searchTerm = "xxxxx";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });

    it("should not show hidden product when you are not an admin", function () {
      const productId = createProduct(false, "Visible Product Test");
      buildProductSearchRecord(productId);
      const product = Products.findOne(productId);
      const searchTerm = product.title;
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });
  });
});

