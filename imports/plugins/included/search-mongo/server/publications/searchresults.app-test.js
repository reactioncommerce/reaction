/* eslint prefer-arrow-callback:0 */
import faker from "faker";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";
import { getSlug } from "/lib/api";
import { Products, OrderSearch } from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import {
  buildProductSearch,
  buildProductSearchRecord,
  buildAccountSearchRecord,
  buildAccountSearch
} from "../methods/searchcollections";
import { getResults } from "./searchresults";

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
    isVisible,
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
  let sandbox;

  before(function () {
    buildAccountSearch();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    account = createAccount();
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(account._id, ["forceIndex"]);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("account search", function () {
    it("should match accounts when searching by email", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const email = account.emails[0].address;
      const results = getResults.accounts(email);
      expect(results.count()).to.equal(1);
    });

    it("should not return results if not an admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const email = account.emails[0].address;
      const results = getResults.accounts(email);
      expect(results).to.be.undefined;
    });
  });
});

describe("Order Search results", function () {
  before(function () {
    OrderSearch.insert({
      shopId: Reaction.getShopId(),
      shippingName: "Ship Name",
      billingName: "Bill Name",
      userEmails: ["test@example.com"]
    });
  });

  describe("order search", function () {
    it("should match orders when searching by email", function () {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("test@example.com");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should not return results if not an admin", function () {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => false);
      const results = getResults.orders("test@example.com");
      expect(results).to.be.undefined;
      roleStub.restore();
    });

    it("should return results when searching by shipping name", function () {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("Ship Name");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should return results when searching by billing name", function () {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("Bill Name");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });

    it("should return results when searching by billing name and be case insensitive", function () {
      const roleStub = sinon.stub(Reaction, "hasPermission", () => true);
      const results = getResults.orders("biLl nAme");
      expect(results.count()).to.equal(1);
      roleStub.restore();
    });
  });
});
