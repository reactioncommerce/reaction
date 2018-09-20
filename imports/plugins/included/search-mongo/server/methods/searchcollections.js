/* eslint camelcase: 0 */
import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { ProductSearch, OrderSearch, AccountSearch, Orders, Products, Accounts, Shops } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import buildOrderSearchRecord from "../no-meteor/util/buildOrderSearchRecord";
import utils from "./common";
import { transformations } from "./transformations";

const requiredFields = {};
requiredFields.products = ["_id", "hashtags", "shopId", "handle", "price", "isVisible", "isSoldOut", "isLowQuantity", "isBackorder"];
requiredFields.orders = ["_id", "shopId", "shippingName", "shippingPhone", "billingName", "userEmails",
  "shippingAddress", "billingAddress", "shippingStatus", "billingStatus", "orderTotal", "orderDate"];
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
  const fieldKeys = Object.keys(customFields);
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
  for (const weight of Object.keys(settings[collection].weights)) {
    if (customFields.includes(weight)) {
      weightObject[weight] = settings[collection].weights[weight];
    }
  }
  return weightObject;
}

function getSearchLanguage() {
  const shopId = Reaction.getShopId();
  const shopLanguage = Shops.findOne(shopId).language;
  if (supportedLanguages.includes(shopLanguage)) {
    return { default_language: shopLanguage };
  }
  return { default_language: "en" };
}

/**
 * When using Collection.rawCollection() methods that return a Promise,
 * handle the errors in a catch. However, ignore errors with altering indexes
 * before a collection exists.
 * @param  {Error} error an error object returned from a Promise rejection
 * @return {undefined}   doesn't return anything
 * @private
 */
function handleIndexUpdateFailures(error) {
  // If we get an error from the Mongo driver because something tried to drop a
  // collection before it existed, log it out as debug info.
  // Otherwise, log whatever happened as an error.
  if (error.name === "MongoError" && error.message === "ns not found") {
    Logger.debug(error, "Attempted to set or remove indexes in a Mongo collection that doesn't exist yet");
  } else {
    Logger.error(error);
  }
}

export function getSearchParameters(collection = "products") {
  const settings = utils.getPackageSettings();
  const customFields = filterFields(settings[collection].includes);
  const fieldSet = requiredFields[collection].concat(customFields);
  const weightObject = getScores(customFields, settings);
  return { fieldSet, weightObject, customFields };
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
  const products = Products.find({ type: "simple" }).fetch();
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
  rawProductSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  const options = getSearchLanguage();
  options.weights = weightObject;
  rawProductSearchCollection.createIndex(indexObject, options).catch(handleIndexUpdateFailures);
  if (cb) {
    cb();
  }
}

// we build this immediately on startup so that search will not throw an error
export function buildEmptyProductSearch() {
  const { weightObject, customFields } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  const options = getSearchLanguage();
  options.weights = weightObject;
  rawProductSearchCollection.createIndex(indexObject, options).catch(handleIndexUpdateFailures);
}

export function rebuildProductSearchIndex(cb) {
  check(cb, Match.Optional(Function));
  const { customFields, weightObject } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  const options = getSearchLanguage();
  options.weights = weightObject;
  rawProductSearchCollection.createIndex(indexObject, options).catch(handleIndexUpdateFailures);
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
  const options = getSearchLanguage();
  options.weights = weightObject;
  rawProductSearchCollection.createIndex(indexObject, options).catch(handleIndexUpdateFailures);
}

export function buildOrderSearch(cb) {
  check(cb, Match.Optional(Function));
  const orders = Orders.find({}).fetch();

  for (const order of orders) {
    try {
      Promise.await(buildOrderSearchRecord(rawCollections, order));
    } catch (error) {
      // Log the error but keep looping and trying to process the others
      Logger.error(`Error running buildOrderSearchRecord for order ${order._id}`, error);
    }
  }

  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  rawOrderSearchCollection.createIndex({
    shopId: 1, shippingName: 1, billingName: 1, userEmails: 1
  }).catch(handleIndexUpdateFailures);

  if (cb) {
    cb();
  }
}

export function buildAccountSearchRecord(accountId, updatedFields) {
  Logger.debug("building account search record");
  check(accountId, String);
  check(updatedFields, Array);

  const account = Accounts.findOne(accountId);
  // let's ignore anonymous accounts
  if (account && account.emails && account.emails.length) {
    const accountSearch = {};

    // Not all required fields are used in search
    // We need to filter through fields that are used,
    // and only update the search index if one of those fields were updated
    // forceIndex is included to forceIndexing on startup, or when manually added
    const searchableFields = ["forceIndex", "shopId", "emails", "firstName", "lastName", "phone"];

    const shouldRunIndex = updatedFields && updatedFields.some((field) => searchableFields.includes(field));

    // If updatedFields contains one of the searchableFields, run the indexing
    if (shouldRunIndex) {
      AccountSearch.remove(accountId);
      for (const field of requiredFields.accounts) {
        if (transformations.accounts[field]) {
          accountSearch[field] = transformations.accounts[field](account[field]);
        } else {
          accountSearch[field] = account[field];
        }
      }
      AccountSearch.insert(accountSearch);
    }
  }
}

export function buildAccountSearch(cb) {
  check(cb, Match.Optional(Function));
  AccountSearch.remove({});
  const accounts = Accounts.find({}).fetch();
  for (const account of accounts) {
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(account._id, ["forceIndex"]);
  }
  const rawAccountSearchCollection = AccountSearch.rawCollection();
  rawAccountSearchCollection.dropIndexes().catch(handleIndexUpdateFailures);
  rawAccountSearchCollection.createIndex({ shopId: 1, emails: 1 }).catch(handleIndexUpdateFailures);
  if (cb) {
    cb();
  }
}
