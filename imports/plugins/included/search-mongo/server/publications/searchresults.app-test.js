import { expect } from "meteor/practicalmeteor:chai";
import { Reaction } from "/server/api";
import { Products } from "/lib/collections";
import Fixtures from "/server/imports/fixtures";
import { getResults } from "./searchresults";
import { buildProductSearch } from "../methods/searchcollections";

Fixtures();

describe("Search results", function () {
  const shopId = Reaction.getShopId();

  before(function () {
    buildProductSearch();
  });

  describe("product search", function () {
    it("produce at least one result for title match", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title;
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("produce results which are case insensitive to lowercase", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title.toLowerCase();
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("produce results which are case insensitive to uppercase", function () {
      const product = Products.findOne({
        shopId: shopId
      });
      const searchTerm = product.title.toUpperCase();
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.be.above(0);
    });

    it("produce no results for phony title match", function () {
      const searchTerm = "xxxxx";
      const results = getResults.products(searchTerm);
      const numResults = results.count();
      expect(numResults).to.equal(0);
    });
  });
});

