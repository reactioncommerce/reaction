import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Products } from "/lib/collections";

function buildSearchResults(products) {
  let searchResults = [];
  for (let product of products) {
    let searchProduct = {
      title: product.title,
      pageTitle: product.pageTitle,
      priceRange: product.price.range,
      vendor: product.vendor,
      description: product.description,
      isLowQuantity: product.isLowQuantity,
      metafields: product.metafields
    };
    searchResults.push(searchProduct);
  }
  return searchResults;
}

Meteor.methods({
  search: function (collection = "product", searchString, maxResults) {
    check(collection, Match.Optional(String));
    check(searchString, String);
    check(maxResults, Match.Optional(Number));

    if (collection === "product") {
      const products = Products.find({
        shopId: Reaction.getShopId(),
        type: "simple"
      }).fetch();
      let results = buildSearchResults(products);
      Logger.info(results);
      return results;
    }
    return [];
  }
});
