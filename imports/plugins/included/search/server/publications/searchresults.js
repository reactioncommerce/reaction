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
    const searchTags = facets || [];
    Logger.info(`Filter by: ${searchTags}`);
    let findTerm = {
      shopId: shopId,
      title: {
        $regex: ".*" + searchTerm + ".*",
        $options: "i"
      }
    };
    if (searchTags.length) {
      findTerm = {
        shopId: shopId,
        title: {
          $regex: ".*" + searchTerm + ".*",
          $options: "i"
        },
        hashtags: { $all: searchTags }
      };
    }
    // Logger.info(`Using findTerm ${JSON.stringify(findTerm, null, 4)}`);
    const productResults = Products.find(findTerm, {
      title: 1,
      hashtags: 1
    });
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
  Logger.info(`Found ${results[1].count()} tags`);
  return results;
});
