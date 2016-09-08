import faker from "faker";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/server/api";
import { getSlug } from "/lib/api";
import { Products } from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { getResults } from "./searchresults";
import { buildProductSearch,
  buildProductSearchRecord,
  buildAccountSearchRecord, buildAccountSearch } from "../methods/searchcollections";

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

function createAccount() {
  const account = Factory.create("account");
  return account;
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

describe("Account Search results", function () {
  let account;

  before(function () {
    buildAccountSearch();
  });

  beforeEach(function () {
    account = createAccount();
    buildAccountSearchRecord(account._id);
  });

  describe("account search", function () {
    it("should match accounts when searching by email", function () {
      const roleStub = sinon.stub(Roles, "userIsInRole", () => true);
      const email = account.emails[0].address;
      const results = getResults.accounts(email);
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should not return results if not an admin", function () {
      const roleStub = sinon.stub(Roles, "userIsInRole", () => false);
      const email = account.emails[0].address;
      const results = getResults.accounts(email);
      expect(results).to.be.undefined;
      roleStub.restore();
    });
  });
});
