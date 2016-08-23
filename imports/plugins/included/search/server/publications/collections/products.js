import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Tags } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

Meteor.publish("SearchResults", function (collection, searchTerm, facets) {
  check(collection, String);
  check(searchTerm, Match.Optional(String));
  check(facets, Match.OneOf([String], undefined));
  Logger.info(`Returning search results on ${collection}. SearchTerm: ${searchTerm}`);
  const shopId = Reaction.getShopId();
  let results;
  if (collection === "products") {
    if (!searchTerm) {
      return this.ready();
    }
    const productResults = Products.find({
      shopId: shopId,
      title: {
        $regex: ".*" + searchTerm + ".*",
        $options: "i"
      }
    }, {
      title: 1,
      hashtags: 1
    });
    const hashtags = [];
    for (const product of productResults.fetch()) {
      for (const hashtag of product.hashtags) {
        Logger.info(`product ${product.title} has hashtags ${hashtag}`);
        if (!_.includes(hashtags, hashtag)) {
          hashtags.push(hashtag);
        }
      }
    }
    Logger.info(`Looking for hastags ${hashtags}`);
    const hashtagResults = Tags.find({
      _id: { $in: hashtags }
    });
    results = [productResults, hashtagResults];
  }

  Logger.info(`Found ${results[0].count()} products`);
  Logger.info(`Found ${results[1].count()} tags`);
  return results;
});
