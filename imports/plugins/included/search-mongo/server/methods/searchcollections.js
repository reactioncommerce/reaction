/* eslint camelcase: 0 */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { ProductSearch, OrderSearch, AccountSearch, Orders, Products, Accounts, Shops } from "/lib/collections";
import utils from "./common";
import { transformations } from "./transformations";


const requiredFields = {};
requiredFields.products = ["_id", "hashtags", "shopId", "handle", "price", "isVisible"];
requiredFields.orders = ["_id", "shopId", "shippingName", "billingName", "userEmails"];
requiredFields.accounts = ["_id", "shopId", "emails", "profile"];

// https://docs.mongodb.com/manual/reference/text-search-languages/#text-search-languages
// MongoDb supports a subset of languages for analysis of the text data which includes
// things like stop words and stems. With this language support the quality of the search matches
// and weighting increases, however without this search will still work and delivery good results.
// We currently support the languages which are supported by Mongo by default but more languages
// are available through custom configuration.
const supportedLanguages = ["da", "nl", "en", "fi", "fr", "de", "hu", "it", "nb", "pt", "ro", "ru", "es", "sv", "tr"];


function filterFields(customFields) {
  const fieldNames = [];
  const fieldKeys = _.keys(customFields);
  for (const fieldKey of fieldKeys) {
    if (customFields[fieldKey]) {
      fieldNames.push(fieldKey);
    }
  }
  return fieldNames;
}

// get the weights for all enabled fields
function getScores(customFields, settings, collection = "products") {
  const weightObject = {};
  for (const weight of _.keys(settings[collection].weights)) {
    if (_.includes(customFields, weight)) {
      weightObject[weight] = settings[collection].weights[weight];
    }
  }
  return weightObject;
}

function getSearchLanguage() {
  const shopId = Reaction.getShopId();
  const shopLanguage = Shops.findOne(shopId).language;
  if (_.includes(supportedLanguages, shopLanguage)) {
    return { default_language: shopLanguage };
  }
  return { default_language: "en" };
}

export function getSearchParameters(collection = "products") {
  const settings = utils.getPackageSettings();
  const customFields = filterFields(settings[collection].includes);
  const fieldSet = requiredFields[collection].concat(customFields);
  const weightObject = getScores(customFields, settings);
  return { fieldSet: fieldSet, weightObject: weightObject, customFields: customFields };
}

export function buildProductSearchRecord(productId) {
  const product = Products.findOne(productId);
  if (product.type === "simple") {
    const { fieldSet } = getSearchParameters();
    const productRecord = {};
    for (const field of fieldSet) {
      if (transformations.products[field]) {
        productRecord[field] = transformations.products[field](product[field]);
      } else {
        productRecord[field] = product[field];
      }
    }
    const productSearchRecord = ProductSearch.insert(productRecord);
    ensureProductSearchIndex();
    return productSearchRecord;
  }
  return undefined;
}

export function buildProductSearch(cb) {
  check(cb, Match.Optional(Function));
  Logger.debug("Start (re)Building ProductSearch Collection");
  ProductSearch.remove({});
  const { fieldSet, weightObject, customFields } = getSearchParameters();
  const products = Products.find({type: "simple"}).fetch();
  for (const product of products) {
    const productRecord = {};
    for (const field of fieldSet) {
      if (transformations.products[field]) {
        productRecord[field] = transformations.products[field](product[field]);
      } else {
        productRecord[field] = product[field];
      }
    }
    ProductSearch.insert(productRecord);
  }
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }

  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes("*");
  rawProductSearchCollection.createIndex(indexObject, weightObject, getSearchLanguage());
  if (cb) {
    cb();
  }
}

export function rebuildProductSearchIndex(cb) {
  check(cb, Match.Optional(Function));
  const { customFields, weightObject } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes("*");
  rawProductSearchCollection.createIndex(indexObject, weightObject, getSearchLanguage());
  if (cb) {
    cb();
  }
}

// this only creates the index if it doesn't already exist, `ensureIndex` is deprecated
export function ensureProductSearchIndex() {
  const { customFields, weightObject } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.createIndex(indexObject, weightObject, getSearchLanguage());
}


export function buildOrderSearch(cb) {
  check(cb, Match.Optional(Function));
  const shopId = Reaction.getShopId();
  const orders = Orders.find({}).fetch();
  for (const order of orders) {
    const user = Meteor.users.findOne(order.userId);
    const userEmails = [];
    if (user) {
      for (const email of user.emails) {
        userEmails.push(email.address);
      }
    }
    const orderSearch = {
      _id: order._id,
      shopId: shopId,
      shippingName: order.shipping[0].address.fullName,
      billingName: order.billing[0].address.fullName,
      userEmails: userEmails
    };
    OrderSearch.insert(orderSearch);
  }
  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.dropIndexes("*");
  rawOrderSearchCollection.createIndex({shopId: 1, shippingName: 1, billingName: 1, userEmails: 1});
  if (cb) {
    cb();
  }
}

export function buildOrderSearchRecord(orderId, cb) {
  const order = Orders.findOne(orderId);
  const user = Meteor.users.findOne(order.userId);
  const userEmails = [];
  if (user) {
    for (const email of user.emails) {
      userEmails.push(email.address);
    }
  }
  const orderSearch = {};
  for (const field of requiredFields.orders) {
    if (transformations.orders[field]) {
      orderSearch[field] = transformations.orders[field](order[field]);
    } else {
      orderSearch[field] = order[field];
    }
  }
  orderSearch.emails = userEmails;
  orderSearch.shippingName = order.shipping[0].address.fullName;
  orderSearch.billingName = order.billing[0].address.fullName;
  orderSearch.userEmails = userEmails;
  OrderSearch.insert(orderSearch);
  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.createIndex({shopId: 1, shippingName: 1, billingName: 1, userEmails: 1});
  if (cb) {
    cb();
  }
}

export function buildAccountSearch(cb) {
  check(cb, Match.Optional(Function));
  AccountSearch.remove({});
  const accounts = Accounts.find({}).fetch();
  for (const account of accounts) {
    const accountSearch = {};
    for (const field of requiredFields.accounts) {
      if (transformations.accounts[field]) {
        accountSearch[field] = transformations.accounts[field](account[field]);
      } else {
        accountSearch[field] = account[field];
      }
    }
  }
  const rawAccountSearchCollection = AccountSearch.rawCollection();
  rawAccountSearchCollection.dropIndexes("*");
  rawAccountSearchCollection.createIndex({shopId: 1, emails: 1});
  if (cb) {
    cb();
  }
}

export function buildAccountSearchRecord(accountId, cb) {
  Logger.info("building account search record");
  check(accountId, String);
  check(cb, Match.Optional(Function));
  const account = Accounts.findOne(accountId);
  // let's ignore anonymous accounts
  if (account.emails.length) {
    const accountSearch = {};
    for (const field of requiredFields.accounts) {
      if (transformations.accounts[field]) {
        accountSearch[field] = transformations.accounts[field](account[field]);
      } else {
        accountSearch[field] = account[field];
      }
    }
    AccountSearch.insert(accountSearch);
    const rawAccountSearchCollection = AccountSearch.rawCollection();
    rawAccountSearchCollection.createIndex({shopId: 1, emails: 1});
  }
  if (cb) {
    cb();
  }
}

