import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { ProductSearch, OrderSearch } from "/lib/collections";

const supportedCollections = ["products", "orders", "accounts"];

function getProductFindTerm(searchTerm, searchTags) {
  const shopId = Reaction.getShopId();
  const findTerm = {
    shopId: shopId,
    $text: {$search: searchTerm}
  };
  if (searchTags.length) {
    findTerm.hastags = {$all: searchTags};
  }
  return findTerm;
}

const getResults = {};

getResults.products = function (searchTerm, facets) {
  const searchTags = facets || [];
  const findTerm = getProductFindTerm(searchTerm, searchTags);
  // Logger.info(`Using findTerm ${JSON.stringify(findTerm, null, 4)}`);
  const productResults = ProductSearch.find(findTerm,
    {
      fields: {
        score: {$meta: "textScore"},
        title: 1,
        hashtags: 1
      },
      sort: {score: {$meta: "textScore"}}
    }
  );
  Logger.info(`Found ${productResults.count()} products`);
  return productResults;
};

getResults.orders = function (searchTerm) {
  const shopId = Reaction.getShopId();
  const orderResults = OrderSearch.find({
    shopId: shopId, $text: { $search: searchTerm }
  },
    {
      fields: {
        score: {$meta: "textScore"}
      },
      sort: {score: {$meta: "textScore"}}
    }
  );
  Logger.info(`Found ${orderResults.count()} orders`);
  return orderResults;
};

Meteor.publish("SearchResults", function (collection, searchTerm, facets) {
  check(collection, String);
  check(collection, Match.Where((coll) => {
    return _.includes(supportedCollections, coll);
  }));
  check(searchTerm, Match.Optional(String));
  check(facets, Match.OneOf([String], undefined));
  Logger.info(`Returning search results on ${collection}. SearchTerm: |${searchTerm}|`);
  if (!searchTerm) {
    return this.ready();
  }
  return getResults[collection](searchTerm, facets);
});
