import _ from "lodash";
import escapeStringRegex from "escape-string-regexp";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { ProductSearch, OrderSearch, AccountSearch } from "/lib/collections";

const supportedCollections = ["products", "orders", "accounts"];

function getProductFindTerm(searchTerm, searchTags, userId) {
  const shopId = Reaction.getShopId();
  const findTerm = {
    shopId,
    $text: { $search: searchTerm }
  };
  if (searchTags.length) {
    findTerm.hashtags = { $all: searchTags };
  }
  if (!Roles.userIsInRole(userId, ["admin", "owner"], shopId)) {
    findTerm.isVisible = true;
  }
  // Deletes the shopId field from "findTerm" for primary shop
  // thereby allowing users on primary shop to search all products
  if (shopId === Reaction.getPrimaryShopId()) {
    delete findTerm.shopId;
  }
  return findTerm;
}

export const getResults = {};

getResults.products = function (searchTerm, facets, maxResults, userId) {
  const searchTags = facets || [];
  const findTerm = getProductFindTerm(searchTerm, searchTags, userId);
  const productResults = ProductSearch.find(
    findTerm,
    {
      fields: {
        score: { $meta: "textScore" },
        title: 1,
        hashtags: 1,
        description: 1,
        handle: 1,
        price: 1,
        isSoldOut: 1,
        isLowQuantity: 1,
        isBackorder: 1
      },
      sort: { score: { $meta: "textScore" } },
      limit: maxResults
    }
  );
  return productResults;
};

getResults.orders = function (searchTerm, facets, maxResults, userId) {
  let orderResults;
  const regexSafeSearchTerm = escapeStringRegex(searchTerm);
  const shopId = Reaction.getShopId();
  const findTerm = {
    $and: [
      { shopId },
      {
        $or: [
          {
            _id: {
              $regex: `^${regexSafeSearchTerm}`,
              $options: "i"
            }
          },
          {
            userEmails: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            shippingName: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            billingName: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            billingCard: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            billingPhone: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            shippingPhone: {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            "product.title": {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            "variants.title": {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          },
          {
            "variants.optionTitle": {
              $regex: regexSafeSearchTerm,
              $options: "i"
            }
          }
        ]
      }
    ]
  };
  // Deletes the shopId field from "findTerm" for primary shop
  // thereby allowing users on primary shop to search all products
  if (shopId === Reaction.getPrimaryShopId()) {
    delete findTerm.$and[0].shopId;
  }
  if (Reaction.hasPermission("orders", userId)) {
    orderResults = OrderSearch.find(findTerm, { limit: maxResults });
    Logger.debug(`Found ${orderResults.count()} orders searching for ${regexSafeSearchTerm}`);
  }
  return orderResults;
};

getResults.accounts = function (searchTerm, facets, maxResults, userId) {
  let accountResults;
  const shopId = Reaction.getShopId();
  const searchPhone = _.replace(searchTerm, /\D/g, "");
  if (Reaction.hasPermission("reaction-accounts", userId)) {
    const findTerm = {
      $and: [
        { shopId },
        {
          $or: [
            {
              emails: {
                $regex: searchTerm,
                $options: "i"
              }
            },
            {
              "profile.firstName": {
                $regex: `^${searchTerm}$`,
                $options: "i"
              }
            },
            {
              "profile.lastName": {
                $regex: `^${searchTerm}$`,
                $options: "i"
              }
            },
            {
              "profile.phone": {
                $regex: `^${searchPhone}$`,
                $options: "i"
              }
            }
          ]
        }
      ]
    };
    // Deletes the shopId field from "findTerm" for primary shop
    // thereby allowing users on primary shop to search all products
    if (shopId === Reaction.getPrimaryShopId()) {
      delete findTerm.$and[0].shopId;
    }
    accountResults = AccountSearch.find(findTerm, {
      limit: maxResults
    });
    Logger.debug(`Found ${accountResults.count()} accounts searching for ${searchTerm}`);
  }
  return accountResults;
};

Meteor.publish("SearchResults", function (collection, searchTerm, facets, maxResults = 99) {
  check(collection, String);
  check(collection, Match.Where((coll) => _.includes(supportedCollections, coll)));
  check(searchTerm, Match.Optional(String));
  check(facets, Match.OneOf(Array, undefined));
  Logger.debug(`Returning search results on ${collection}. SearchTerm: |${searchTerm}|. Facets: |${facets}|.`);
  if (!searchTerm) {
    return this.ready();
  }
  return getResults[collection](searchTerm, facets, maxResults, this.userId);
});
