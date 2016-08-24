import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Tags } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { ProductSearch } from "../collections/searchcollections";

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
  Logger.info(`Returning search results on ${collection}. SearchTerm: ${searchTerm}`);
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
          hashtags: 1,
          title: 1
        },
        sort: {score: { $meta: "textScore" } }
      }
    );
    const hashtags = [];
    for (const product of productResults.fetch()) {
      for (const hashtag of product.hashtags) {
        if (!_.includes(hashtags, hashtag)) {
          hashtags.push(hashtag);
        }
      }
    }
    const hashtagResults = Tags.find({
      _id: { $in: hashtags },
      isTopLevel: false
    },
    { name: 1 }
    );
    results = [productResults, hashtagResults];
  }
  Logger.info(`Found ${results[0].count()} products`);
  Logger.info(`Product records: ${JSON.stringify(results[0].fetch(), null, 4)}`);
  Logger.info(`Found ${results[1].count()} product/tags`);
  return results;
});
