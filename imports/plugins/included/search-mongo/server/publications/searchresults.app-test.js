import faker from "faker";
import { expect } from "meteor/practicalmeteor:chai";
import { Reaction } from "/server/api";
import { getSlug } from "/lib/api";
import { Products, ProductSearch } from "/lib/collections";
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

describe("Search results", function () {
  let product;

  before(function () {
    buildProductSearch();
  });

  beforeEach(function () {
    const productId = createProduct(true, "Product Search Test");
    buildProductSearchRecord(productId);
    product = Products.findOne(productId);
  });

  describe("product search", function () {
    it("should produce at least one result for title match", function () {

      const searchTerm = "Product Search Test";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results which are case insensitive", function () {
      const searchTerm = "pRoDuCt SeArCh tEsT";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("should produce results on partial matches", function () {
      const searchTerm = "Product";
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
      const productId = createProduct(false, "isINVisible");
      buildProductSearchRecord(productId);
      product = Products.findOne(productId);
      const searchTerm = product.title;
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });
  });
});

