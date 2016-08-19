import _ from "lodash";
import { Reaction, Logger } from "/server/api";
import { Products, Orders, Accounts, Packages } from "/lib/collections";


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
  for (let product of products) { // prevent adding a duplicate product when found in both exact and partial search
    if (!_.includes(existingIds, product._id)) {
      let searchProduct = Object.assign({}, product);
      searchProduct.weight = weight;
      searchResults.push(searchProduct);
    }
  }
  return searchResults;
};

buildSearchResults.order = function (orders, existingSearchResults) {
  let searchResults = existingSearchResults || [];
  for (let order of orders) {
    let user = Meteor.users.findOne(order.userId);
    let searchOrder = Object.assign({}, order);
    searchOrder.itemCount = searchOrder.itemCount();
    if (user) {
      searchOrder.user = user;
    }
    searchResults.push(searchOrder);
  }
  return searchResults;
};

buildSearchResults.account = function(accounts, existingSearchResults) {
  let searchResults = existingSearchResults || [];
  for (let account of accounts) {
    let searchAccount = {
      _id: account._id,
      userId: account.userId,
      acceptsMarketing: account.acceptsMarketing,
      emails: account.emails,
      state: account.state
    };
    searchResults.push(searchAccount);
  }
  return searchResults;
};


export const searchMethods = {};

searchMethods.product = function (searchString, stopOnExactMatch) {
  // first find exact matches and weight them 10's
  let results;
  const shopId = Reaction.getShopId();
  const exactProducts = Products.find({
    shopId: shopId,
    type: "simple",
    isVisible: true,
    title: {
      $regex: "/^" + searchString + "$/", // we us regex here because we want a case-insentive search
      $options: "i"
    }
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
      $regex: ".*" + searchString + ".*"
    }
  }).fetch();
  Logger.info(`Got ${orders.length} order in partial search`);
  const results = buildSearchResults.order(orders);
  Logger.info(results);
  return results;
};

searchMethods.account = function (searchString) {
  // is there any reason for a partial search on account?
  const accounts = Accounts.find({
    shopId: Reaction.getShopId(),
    emails: { $elemMatch: { address: searchString } }
  }).fetch();
  const results = buildSearchResults.account(accounts);
  Logger.info(results);
  return results;
};
