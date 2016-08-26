import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { ProductSearch } from "/lib/collections";

function getProductFindTerm(searchTerm, searchTags) {
  const shopId = Reaction.getShopId();
  const findTerm = {
    shopId: shopId,
    $text: {$search: searchTerm }
  };
  if (searchTags.length) {
    findTerm.hastags = { $all: searchTags };
  }
  return findTerm;
}

Meteor.publish("SearchResults", function (collection, searchTerm, facets) {
  check(collection, String);
  check(searchTerm, Match.Optional(String));
  check(facets, Match.OneOf([String], undefined));
  Logger.info(`Returning search results on ${collection}. SearchTerm: |${searchTerm}|`);
  let results;
  if (collection === "products") {
    if (!searchTerm) {
      return this.ready();
    }
    const searchTags = facets || [];
    const findTerm = getProductFindTerm(searchTerm, searchTags);
    // Logger.info(`Using findTerm ${JSON.stringify(findTerm, null, 4)}`);
    const productResults = ProductSearch.find(findTerm,
      {
        fields: {
          score: { $meta: "textScore" },
          title: 1,
          hashtags: 1
        },
        sort: {score: { $meta: "textScore" } }
      }
    );
    results = productResults;
  }
  Logger.info(`Found ${results.count()} products`);
  // Logger.info(`Product records: ${JSON.stringify(results.fetch(), null, 4)}`);
  return results;
});
