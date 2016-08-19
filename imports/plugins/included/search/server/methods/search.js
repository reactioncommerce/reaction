import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Products, Orders, Accounts } from "/lib/collections";

const searchAbleCollections = ["product", "order"];

function flattenToIds(products) {
  let ids = [];
  for (let product of products) {
    ids.push(product._id);
  }
  return ids;
}

const buildSearchResults = {};

buildSearchResults.product = function (products, existingSearchResults, weight) {
  let searchResults = existingSearchResults || [];
  const existingIds = flattenToIds(existingSearchResults);
  for (let product of products) {
    if (!_.includes(existingIds, product._id)) {
      let searchProduct = {
        _id: product._id,
        title: product.title,
        pageTitle: product.pageTitle,
        priceRange: product.price.range,
        vendor: product.vendor,
        description: product.description,
        isLowQuantity: product.isLowQuantity,
        metafields: product.metafields,
        weight: weight
      };
      searchResults.push(searchProduct);
    }
  }
  return searchResults;
};

buildSearchResults.order = function (orders, existingSearchResults) {
  let searchResults = existingSearchResults || [];
  for (let order of orders) {
    const user = Accounts.findOne(order.userId);
    let searchOrder = {
      _id: order._id,
      username: user.username,
      items: order.items,
      shipping: order.shipping,
      billing: order.billing
    };
    searchResults.push(searchOrder);
  }
};


const searchMethods = {};

searchMethods.product = function (searchString, stopOnExactMatch) {
  // first find exact matches and weight them 10's
  let results;
  const shopId = Reaction.getShopId();
  const exactProducts = Products.find({
    shopId: shopId,
    type: "simple",
    isVisible: true,
    title: searchString
  }).fetch();
  if (exactProducts) {
    Logger.info(`Got ${exactProducts.length} products in exact search`);
    results = buildSearchResults.product(exactProducts, [], 10);
  }
  // partial matches are then weighted 5
  if (!stopOnExactMatch) {
    const products = Products.find({
      shopId: shopId,
      type: "simple",
      isVisible: true,
      title: {
        $regex: ".*" + searchString + ".*",
        $options: "i"
      }
    }).fetch();
    Logger.info(`Got ${products.length} products in partial search`);
    results = buildSearchResults.product(products, results, 5);
  }
  Logger.info(results);
  return results;
};

searchMethods.order = function (searchString) {
  // blank returns all orders
  if (searchString === "") {
    const orders = Orders.find({}).fetch();
    let results = buildSearchResults.order(orders);
    Logger.info(results);
    return results;
  }
  const orders = Orders.find({
    shopId: Reaction.getShopId(),
    _id: {
      $regex: ".*" + searchString + ".*",
      options: "i"
    }
  }).fetch();
  const results = buildSearchResults.order(orders);
  Logger.info(results);
  return results;
};


Meteor.methods({
  search: function (collection = "product", searchString, maxResults, stopOnExactMatch = false) {
    check(collection, Match.Optional(String));
    // check(collections, Match.OneOf(searchAbleCollections));
    check(searchString, String);
    check(maxResults, Match.Optional(Number));
    Logger.info(`Initiating Search for ${searchString} in ${collection} collection`);
    return searchMethods[collection](searchString, maxResults, stopOnExactMatch);
  }
});
